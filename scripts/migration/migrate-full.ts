#!/usr/bin/env tsx
/**
 * Full MongoDB → PostgreSQL migration script.
 *
 * Usage: yarn migrate:full
 *
 * Reads all documents from MongoDB and writes them to PostgreSQL.
 * Enforces the 20-entry history cap per user.
 * Writes a manifest file with counts and timestamp on completion.
 */

import "dotenv/config";
import { promises as fs } from "fs";
import mongoose from "mongoose";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import User from "../../server/models/user";
import Release from "../../server/models/release";

const HISTORY_CAP = 20;

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter } as any);
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
  imageXLarge?: string; // highest quality — used as the canonical image
  instantScrobbles: string[];
  history: Array<{
    _id: mongoose.Types.ObjectId;
    id: string;
    time: Date;
  }>;
}

async function migrateReleases(prisma: PrismaClient): Promise<number> {
  console.log("Migrating releases...");
  const releases = (await Release.find({}).lean()) as unknown as MongoRelease[];
  let count = 0;

  for (const release of releases) {
    const releaseId = String(release._id);

    await prisma.release.upsert({
      where: { id: releaseId },
      update: {},
      create: {
        id: releaseId,
        discogsId: BigInt(release.id),
        barcode: release.barcode ?? null,
        artist: release.artist,
        title: release.title,
        imageUrl: release.image ?? null,
        discogsUrl: release.url ?? null,
        releaseYear: release.year ?? null,
        createdAt: release.createdAt ?? new Date(),
        updatedAt: release.updatedAt ?? new Date(),
      },
    });

    // Migrate tracks
    for (const track of release.tracks ?? []) {
      const trackId = String(track._id);
      await prisma.releaseTracks.upsert({
        where: { id: trackId },
        update: {},
        create: {
          id: trackId,
          releaseId,
          trackNumber: track.trackNumber ?? 0,
          title: track.title,
          durationSeconds: Math.max(0, Math.round(track.duration ?? 0)),
        },
      });
    }

    count++;
    if (count % 100 === 0) console.log(`  ${count}/${releases.length} releases migrated`);
  }

  console.log(`Releases migrated: ${count}`);
  return count;
}

async function migrateUsers(
  prisma: PrismaClient,
): Promise<{ users: number; history: number; instantScrobbles: number }> {
  console.log("Migrating users...");
  const users = (await User.find({}).lean()) as unknown as MongoUser[];
  let userCount = 0;
  let historyCount = 0;
  let instantScrobbleCount = 0;

  for (const user of users) {
    const userId = String(user._id);

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: user.name,
        email: `${user.name}@lastfm.local`,
        emailVerified: true,
        lastfmUrl: user.url ?? null,
        image: user.imageXLarge ?? user.imageLarge ?? user.image ?? null,
      },
    });

    // Seed the account row so Better Auth recognises this user on first login
    // instead of creating a duplicate. The plugin looks up { providerId, accountId }.
    const accountCreatedAt = user._id.getTimestamp();
    await prisma.account.upsert({
      where: { id: userId },
      update: { accessToken: user.key },
      create: {
        id: userId,
        accountId: user.name,
        providerId: "lastfm",
        userId,
        accessToken: user.key,
        createdAt: accountCreatedAt,
        updatedAt: accountCreatedAt,
      },
    });

    // Migrate history — enforce 20-entry cap (take most recent)
    const history = (user.history ?? []).slice(-HISTORY_CAP);
    for (let i = 0; i < history.length; i++) {
      const entry = history[i];
      const historyId = String(entry._id);
      const releaseId = String(entry.id);

      // Only migrate if the release exists in PostgreSQL
      const releaseExists = await prisma.release.findUnique({ where: { id: releaseId }, select: { id: true } });
      if (!releaseExists) {
        console.warn(`  Skipping history entry ${historyId} — release ${releaseId} not found`);
        continue;
      }

      await prisma.scrobbleHistory.upsert({
        where: { id: historyId },
        update: {},
        create: {
          id: historyId,
          userId,
          releaseId,
          scrobbledAt: entry.time ?? new Date(),
          legacyArrayIndex: i,
        },
      });
      historyCount++;
    }

    // Migrate instant scrobbles
    for (const releaseId of user.instantScrobbles ?? []) {
      const releaseExists = await prisma.release.findUnique({ where: { id: releaseId }, select: { id: true } });
      if (!releaseExists) {
        console.warn(`  Skipping instant scrobble — release ${releaseId} not found`);
        continue;
      }

      await prisma.userInstantScrobble.upsert({
        where: { userId_releaseId: { userId, releaseId } },
        update: {},
        create: { userId, releaseId },
      });
      instantScrobbleCount++;
    }

    userCount++;
    if (userCount % 100 === 0) console.log(`  ${userCount}/${users.length} users migrated`);
  }

  console.log(`Users migrated: ${userCount}`);
  console.log(`History entries migrated: ${historyCount}`);
  console.log(`Instant scrobbles migrated: ${instantScrobbleCount}`);
  return { users: userCount, history: historyCount, instantScrobbles: instantScrobbleCount };
}

async function main() {
  const startTime = new Date();
  console.log(`Migration started at ${startTime.toISOString()}`);

  await connectMongo();
  const prisma = createPrisma();

  try {
    const releaseCount = await migrateReleases(prisma);
    const { users, history, instantScrobbles } = await migrateUsers(prisma);

    const manifest = {
      timestamp: startTime.toISOString(),
      completedAt: new Date().toISOString(),
      counts: {
        releases: releaseCount,
        users,
        history,
        instantScrobbles,
      },
    };

    await fs.writeFile("scripts/migration/migration-manifest.json", JSON.stringify(manifest, null, 2));
    console.log("\nMigration complete!");
    console.log("Manifest written to scripts/migration/migration-manifest.json");
    console.log(manifest);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
