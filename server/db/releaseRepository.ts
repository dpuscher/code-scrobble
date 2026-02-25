/**
 * Release repository — pure Prisma/PostgreSQL implementation.
 * Handles Discogs API integration for firstOrCreate.
 */

import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";
import * as Discogs from "../discogs";

export interface ReleaseData {
  id: string;
  discogsId: number;
  barcode?: string | null;
  artist: string;
  title: string;
  imageUrl?: string | null;
  discogsUrl?: string | null;
  releaseYear?: string | null;
  tracks: Array<{
    id: string;
    trackNumber: number;
    title: string;
    durationSeconds: number;
  }>;
}

function newId(): string {
  return randomBytes(12).toString("hex");
}

function prismaReleaseToData(release: any): ReleaseData {
  return {
    id: release.id,
    discogsId: Number(release.discogsId),
    barcode: release.barcode,
    artist: release.artist,
    title: release.title,
    imageUrl: release.imageUrl,
    discogsUrl: release.discogsUrl,
    releaseYear: release.releaseYear,
    tracks: (release.tracks ?? []).map((t: any) => ({
      id: t.id,
      trackNumber: t.trackNumber,
      title: t.title,
      durationSeconds: t.durationSeconds,
    })),
  };
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function upsertFromDiscogs(discogsId: number, barcode?: string, existingId?: string): Promise<ReleaseData> {
  const data = await Discogs.getRelease(discogsId);

  const releaseId = existingId ?? newId();

  const release = await prisma.release.upsert({
    where: { id: releaseId },
    update: {
      artist: data.artist,
      title: data.title,
      imageUrl: data.image ?? null,
      discogsUrl: data.url ?? null,
      releaseYear: data.year ?? null,
      barcode: barcode ?? data.barcode ?? null,
      updatedAt: new Date(),
    },
    create: {
      id: releaseId,
      discogsId: BigInt(discogsId),
      barcode: barcode ?? data.barcode ?? null,
      artist: data.artist,
      title: data.title,
      imageUrl: data.image ?? null,
      discogsUrl: data.url ?? null,
      releaseYear: data.year ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
  });

  // Replace tracks
  await prisma.releaseTracks.deleteMany({ where: { releaseId: release.id } });
  for (const track of data.tracks) {
    await prisma.releaseTracks.create({
      data: {
        id: newId(),
        releaseId: release.id,
        trackNumber: track.trackNumber,
        title: track.title,
        durationSeconds: Math.max(0, Math.round(track.duration)),
      },
    });
  }

  const updated = await prisma.release.findUniqueOrThrow({
    where: { id: release.id },
    include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
  });
  return prismaReleaseToData(updated);
}

export async function findReleaseById(id: string): Promise<ReleaseData | null> {
  const release = await prisma.release.findUnique({
    where: { id },
    include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
  });
  return release ? prismaReleaseToData(release) : null;
}

export async function findReleaseByBarcode(barcode: string): Promise<ReleaseData | null> {
  const release = await prisma.release.findFirst({
    where: { barcode },
    include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
  });
  return release ? prismaReleaseToData(release) : null;
}

export async function findReleaseByDiscogsId(discogsId: number): Promise<ReleaseData | null> {
  const release = await prisma.release.findUnique({
    where: { discogsId: BigInt(discogsId) },
    include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
  });
  return release ? prismaReleaseToData(release) : null;
}

/**
 * Find by barcode or Discogs ID, creating from Discogs API if needed.
 * Refreshes stale records (older than 1 week).
 */
export async function firstOrCreateRelease(param: {
  id?: string | number;
  barcode?: string;
}): Promise<ReleaseData | null> {
  // Try to find existing record
  let existing = null;
  if (param.id) {
    existing = await prisma.release.findUnique({
      where: { discogsId: BigInt(param.id) },
      include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
    });
  } else if (param.barcode) {
    existing = await prisma.release.findFirst({
      where: { barcode: param.barcode },
      include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
    });
  }

  if (existing) {
    // Refresh if stale (older than 1 week)
    if (new Date().getTime() - existing.updatedAt.getTime() > ONE_WEEK_MS) {
      return upsertFromDiscogs(Number(existing.discogsId), existing.barcode ?? undefined, existing.id);
    }
    return prismaReleaseToData(existing);
  }

  // Not found — resolve Discogs ID and create
  let discogsId: number | undefined;
  if (param.id) {
    discogsId = Number(param.id);
  } else if (param.barcode) {
    discogsId = await Discogs.barcode(param.barcode);
  }
  if (!discogsId) return null;

  // Handle race: another request may have created it concurrently
  const concurrent = await prisma.release.findUnique({
    where: { discogsId: BigInt(discogsId) },
    include: { tracks: { orderBy: [{ trackNumber: "asc" }, { id: "asc" }] } },
  });
  if (concurrent) return prismaReleaseToData(concurrent);

  return upsertFromDiscogs(discogsId, param.barcode);
}
