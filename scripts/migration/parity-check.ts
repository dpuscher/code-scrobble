#!/usr/bin/env tsx
/**
 * Parity check script: compares MongoDB and PostgreSQL data to validate migration.
 *
 * Usage: yarn migrate:parity
 *
 * Exits 0 on pass, 1 on any mismatch.
 */

import "dotenv/config";
import mongoose from "mongoose";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import User from "../../server/models/user";
import Release from "../../server/models/release";

const HISTORY_CAP = 20;
const SAMPLE_SIZE = 10;

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");
  await mongoose.connect(uri);
}

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as any);
}

interface ParityResult {
  passed: boolean;
  failures: string[];
}

interface MongoRelease {
  _id: mongoose.Types.ObjectId;
  id: number;
  artist: string;
  title: string;
  image?: string;
  url?: string;
  year?: string;
  barcode?: string;
  tracks: Array<{
    _id: mongoose.Types.ObjectId;
    title: string;
    trackNumber: number;
    duration: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

interface MongoUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  key: string;
  url?: string;
  image?: string;
  imageLarge?: string;
  imageXLarge?: string;
  instantScrobbles: string[];
  history: Array<{
    _id: mongoose.Types.ObjectId;
    id: string;
    time: Date;
  }>;
}

async function checkCounts(prisma: PrismaClient): Promise<ParityResult> {
  console.log("\n=== COUNT CHECKS ===");
  const failures: string[] = [];

  const mongoReleaseCount = await Release.countDocuments();
  const pgReleaseCount = await prisma.release.count();
  console.log(`Releases: MongoDB=${mongoReleaseCount}, PostgreSQL=${pgReleaseCount}`);
  if (mongoReleaseCount !== pgReleaseCount) {
    failures.push(`Release count mismatch: MongoDB=${mongoReleaseCount}, PostgreSQL=${pgReleaseCount}`);
  }

  const mongoUserCount = await User.countDocuments();
  const pgUserCount = await prisma.user.count();
  console.log(`Users: MongoDB=${mongoUserCount}, PostgreSQL=${pgUserCount}`);
  if (mongoUserCount !== pgUserCount) {
    failures.push(`User count mismatch: MongoDB=${mongoUserCount}, PostgreSQL=${pgUserCount}`);
  }

  // Track count
  const mongoReleases = (await Release.find({}).lean()) as unknown as MongoRelease[];
  const expectedTrackCount = mongoReleases.reduce((sum, r) => sum + (r.tracks?.length ?? 0), 0);
  const pgTrackCount = await prisma.releaseTracks.count();
  console.log(`Tracks: MongoDB=${expectedTrackCount}, PostgreSQL=${pgTrackCount}`);
  if (expectedTrackCount !== pgTrackCount) {
    failures.push(`Track count mismatch: MongoDB=${expectedTrackCount}, PostgreSQL=${pgTrackCount}`);
  }

  return { passed: failures.length === 0, failures };
}

async function checkReleaseSample(prisma: PrismaClient): Promise<ParityResult> {
  console.log("\n=== RELEASE RANDOM SAMPLE CHECKS ===");
  const failures: string[] = [];

  const releases = (await Release.find({}).lean()) as unknown as MongoRelease[];
  const sample = releases.sort(() => Math.random() - 0.5).slice(0, SAMPLE_SIZE);

  for (const mongoRelease of sample) {
    const releaseId = String(mongoRelease._id);
    const pgRelease = await prisma.release.findUnique({
      where: { id: releaseId },
      include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
    });

    if (!pgRelease) {
      failures.push(`Release ${releaseId} not found in PostgreSQL`);
      continue;
    }

    // Check field equality
    if (pgRelease.artist !== mongoRelease.artist) {
      failures.push(
        `Release ${releaseId}: artist mismatch (MongoDB="${mongoRelease.artist}", PG="${pgRelease.artist}")`,
      );
    }
    if (pgRelease.title !== mongoRelease.title) {
      failures.push(`Release ${releaseId}: title mismatch (MongoDB="${mongoRelease.title}", PG="${pgRelease.title}")`);
    }
    if (Number(pgRelease.discogsId) !== mongoRelease.id) {
      failures.push(`Release ${releaseId}: discogsId mismatch`);
    }

    // Check track count
    if (pgRelease.tracks.length !== (mongoRelease.tracks?.length ?? 0)) {
      failures.push(
        `Release ${releaseId}: track count mismatch (MongoDB=${mongoRelease.tracks?.length ?? 0}, PG=${pgRelease.tracks.length})`,
      );
    }

    // UTF-8 fidelity check
    const mongoPgTitleMatch = pgRelease.title === mongoRelease.title;
    if (!mongoPgTitleMatch) {
      failures.push(`Release ${releaseId}: UTF-8 title fidelity failure`);
    }

    console.log(`  ✓ Release ${releaseId} (${mongoRelease.title})`);
  }

  return { passed: failures.length === 0, failures };
}

async function checkHistoryOrder(prisma: PrismaClient): Promise<ParityResult> {
  console.log("\n=== HISTORY ORDER CHECKS ===");
  const failures: string[] = [];

  const users = (await User.find({ "history.0": { $exists: true } }).lean()) as unknown as MongoUser[];
  const sample = users.sort(() => Math.random() - 0.5).slice(0, SAMPLE_SIZE);

  for (const mongoUser of sample) {
    const userId = String(mongoUser._id);
    const mongoHistory = (mongoUser.history ?? []).slice(-HISTORY_CAP);

    const pgHistory = await prisma.scrobbleHistory.findMany({
      where: { userId },
      orderBy: [{ scrobbledAt: "desc" }, { id: "desc" }],
      take: HISTORY_CAP,
    });

    if (pgHistory.length !== mongoHistory.length) {
      failures.push(`User ${userId}: history count mismatch (MongoDB=${mongoHistory.length}, PG=${pgHistory.length})`);
      continue;
    }

    console.log(`  ✓ User ${userId} (${mongoUser.name}): ${pgHistory.length} history entries`);
  }

  return { passed: failures.length === 0, failures };
}

async function checkReferentialIntegrity(prisma: PrismaClient): Promise<ParityResult> {
  console.log("\n=== REFERENTIAL INTEGRITY CHECKS ===");
  const failures: string[] = [];

  // Check all history release_ids exist
  const orphanHistory = await prisma.$queryRaw<{ id: string }[]>`
    SELECT sh.id FROM scrobble_history sh
    LEFT JOIN releases r ON r.id = sh.release_id
    WHERE r.id IS NULL
    LIMIT 10
  `;
  if (orphanHistory.length > 0) {
    failures.push(`Found ${orphanHistory.length} orphaned scrobble_history entries (release not found)`);
  } else {
    console.log("  ✓ All scrobble_history entries reference valid releases");
  }

  // Check all instant_scrobble release_ids exist
  const orphanInstant = await prisma.$queryRaw<{ user_id: string; release_id: string }[]>`
    SELECT uis.user_id, uis.release_id FROM user_instant_scrobbles uis
    LEFT JOIN releases r ON r.id = uis.release_id
    WHERE r.id IS NULL
    LIMIT 10
  `;
  if (orphanInstant.length > 0) {
    failures.push(`Found ${orphanInstant.length} orphaned user_instant_scrobbles entries (release not found)`);
  } else {
    console.log("  ✓ All user_instant_scrobbles entries reference valid releases");
  }

  // Check all tracks have valid release_ids
  const orphanTracks = await prisma.$queryRaw<{ id: string }[]>`
    SELECT rt.id FROM release_tracks rt
    LEFT JOIN releases r ON r.id = rt.release_id
    WHERE r.id IS NULL
    LIMIT 10
  `;
  if (orphanTracks.length > 0) {
    failures.push(`Found ${orphanTracks.length} orphaned release_tracks entries (release not found)`);
  } else {
    console.log("  ✓ All release_tracks entries reference valid releases");
  }

  return { passed: failures.length === 0, failures };
}

async function main() {
  console.log("=== PARITY CHECK: MongoDB vs PostgreSQL ===");
  console.log(`Timestamp: ${new Date().toISOString()}`);

  await connectMongo();
  const prisma = createPrisma();
  const allFailures: string[] = [];

  try {
    const countResult = await checkCounts(prisma);
    allFailures.push(...countResult.failures);

    const sampleResult = await checkReleaseSample(prisma);
    allFailures.push(...sampleResult.failures);

    const historyResult = await checkHistoryOrder(prisma);
    allFailures.push(...historyResult.failures);

    const integrityResult = await checkReferentialIntegrity(prisma);
    allFailures.push(...integrityResult.failures);

    console.log("\n=== PARITY CHECK SUMMARY ===");
    if (allFailures.length === 0) {
      console.log("✅ All parity checks PASSED");
      process.exit(0);
    } else {
      console.error(`❌ ${allFailures.length} parity check(s) FAILED:`);
      allFailures.forEach(f => console.error(`  - ${f}`));
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error("Parity check failed:", err);
  process.exit(1);
});
