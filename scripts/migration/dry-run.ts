#!/usr/bin/env tsx
/**
 * Dry-run migration script: validates MongoDB data and simulates the migration
 * without writing to PostgreSQL. Prints what would be written.
 *
 * Usage: yarn migrate:dry-run
 */

import "dotenv/config";
import mongoose from "mongoose";
import User from "../../server/models/user";
import Release from "../../server/models/release";

const HISTORY_CAP = 20;

async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
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

async function dryRunReleases() {
  const releases = (await Release.find({}).lean()) as unknown as MongoRelease[];
  console.log(`\n=== RELEASES (${releases.length} total) ===`);

  const releaseIds = new Set<string>();
  let trackCount = 0;
  let warnings = 0;

  for (const release of releases) {
    const releaseId = String(release._id);
    releaseIds.add(releaseId);
    trackCount += (release.tracks ?? []).length;

    if (!release.id) {
      console.warn(`  WARNING: Release ${releaseId} has no Discogs ID`);
      warnings++;
    }
    if (!release.artist) {
      console.warn(`  WARNING: Release ${releaseId} has no artist`);
      warnings++;
    }
    if (!release.title) {
      console.warn(`  WARNING: Release ${releaseId} has no title`);
      warnings++;
    }
  }

  console.log(`  Releases to migrate: ${releases.length}`);
  console.log(`  Total tracks: ${trackCount}`);
  console.log(`  Warnings: ${warnings}`);

  return releaseIds;
}

async function dryRunUsers(releaseIds: Set<string>) {
  const users = (await User.find({}).lean()) as unknown as MongoUser[];
  console.log(`\n=== USERS (${users.length} total) ===`);

  let totalHistory = 0;
  let cappedHistory = 0;
  let skippedHistory = 0;
  let totalInstantScrobbles = 0;
  let skippedInstantScrobbles = 0;

  for (const user of users) {
    const userId = String(user._id);
    const rawHistory = user.history ?? [];
    const cappedEntries = rawHistory.slice(-HISTORY_CAP);

    totalHistory += cappedEntries.length;
    if (rawHistory.length > HISTORY_CAP) {
      const dropped = rawHistory.length - HISTORY_CAP;
      console.log(`  User ${userId} (${user.name}): dropping ${dropped} oldest history entries (cap: ${HISTORY_CAP})`);
      cappedHistory += dropped;
    }

    for (const entry of cappedEntries) {
      if (!releaseIds.has(String(entry.id))) {
        console.warn(`  WARNING: History entry for user ${userId} references unknown release ${entry.id}`);
        skippedHistory++;
      }
    }

    for (const releaseId of user.instantScrobbles ?? []) {
      totalInstantScrobbles++;
      if (!releaseIds.has(releaseId)) {
        console.warn(`  WARNING: Instant scrobble for user ${userId} references unknown release ${releaseId}`);
        skippedInstantScrobbles++;
      }
    }
  }

  console.log(`  Users to migrate: ${users.length}`);
  console.log(`  History entries (after cap): ${totalHistory}`);
  console.log(`  History entries dropped by cap: ${cappedHistory}`);
  console.log(`  History entries skipped (missing release): ${skippedHistory}`);
  console.log(`  Instant scrobbles: ${totalInstantScrobbles - skippedInstantScrobbles}`);
  console.log(`  Instant scrobbles skipped (missing release): ${skippedInstantScrobbles}`);
}

async function main() {
  console.log("=== DRY RUN MIGRATION (no writes to PostgreSQL) ===");
  console.log(`Timestamp: ${new Date().toISOString()}`);

  await connectMongo();

  try {
    const releaseIds = await dryRunReleases();
    await dryRunUsers(releaseIds);

    console.log("\n=== DRY RUN COMPLETE ===");
    console.log("No data was written to PostgreSQL.");
    console.log("Review warnings above before running the full migration.");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(err => {
  console.error("Dry run failed:", err);
  process.exit(1);
});
