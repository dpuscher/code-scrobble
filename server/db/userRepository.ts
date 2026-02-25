/**
 * User repository — pure Prisma/PostgreSQL implementation.
 */

import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma";

const HISTORY_CAP = 20;

function newId(): string {
  return randomBytes(12).toString("hex");
}

export interface UserData {
  id: string;
  name: string;
  lastfmSessionKey: string;
  lastfmUrl?: string | null;
  imageSmall?: string | null;
  imageLarge?: string | null;
  imageXLarge?: string | null;
}

export interface HistoryItem {
  id: string;
  releaseId: string;
  scrobbledAt: Date;
}

export async function findUserById(userId: string): Promise<UserData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    lastfmSessionKey: user.lastfmSessionKey,
    lastfmUrl: user.lastfmUrl,
    imageSmall: user.imageSmall,
    imageLarge: user.imageLarge,
    imageXLarge: user.imageXLarge,
  };
}

export async function getHistory(userId: string): Promise<HistoryItem[]> {
  const rows = await prisma.scrobbleHistory.findMany({
    where: { userId },
    orderBy: [{ scrobbledAt: "desc" }, { id: "desc" }],
    take: HISTORY_CAP,
  });
  return rows.map(r => ({ id: r.id, releaseId: r.releaseId, scrobbledAt: r.scrobbledAt }));
}

export async function appendHistory(userId: string, releaseId: string): Promise<void> {
  await prisma.$transaction(async tx => {
    await tx.scrobbleHistory.create({
      data: {
        id: newId(),
        userId,
        releaseId,
        scrobbledAt: new Date(),
      },
    });

    // Enforce 20-entry cap: delete entries beyond the top 20
    const all = await tx.scrobbleHistory.findMany({
      where: { userId },
      orderBy: [{ scrobbledAt: "desc" }, { id: "desc" }],
      select: { id: true },
    });
    const toDelete = all.slice(HISTORY_CAP).map(r => r.id);
    if (toDelete.length > 0) {
      await tx.scrobbleHistory.deleteMany({ where: { id: { in: toDelete } } });
    }
  });
}

export async function getInstantScrobbles(userId: string): Promise<string[]> {
  const rows = await prisma.userInstantScrobble.findMany({ where: { userId } });
  return rows.map(r => r.releaseId);
}

export async function addInstantScrobble(userId: string, releaseId: string): Promise<void> {
  await prisma.userInstantScrobble.upsert({
    where: { userId_releaseId: { userId, releaseId } },
    update: {},
    create: { userId, releaseId },
  });
}

export async function removeInstantScrobble(userId: string, releaseId: string): Promise<void> {
  await prisma.userInstantScrobble.delete({ where: { userId_releaseId: { userId, releaseId } } }).catch(() => {
    // Ignore if already removed
  });
}

export async function upsertUser(data: {
  name: string;
  key: string;
  url?: string;
  image?: string;
  imageLarge?: string;
  imageXLarge?: string;
}): Promise<UserData> {
  // Look up by name to preserve existing ID
  const existing = await prisma.user.findFirst({ where: { name: data.name } });
  const id = existing?.id ?? newId();

  const user = await prisma.user.upsert({
    where: { id },
    update: {
      lastfmSessionKey: data.key,
      lastfmUrl: data.url ?? null,
      imageSmall: data.image ?? null,
      imageLarge: data.imageLarge ?? null,
      imageXLarge: data.imageXLarge ?? null,
      updatedAt: new Date(),
    },
    create: {
      id,
      name: data.name,
      lastfmSessionKey: data.key,
      lastfmUrl: data.url ?? null,
      imageSmall: data.image ?? null,
      imageLarge: data.imageLarge ?? null,
      imageXLarge: data.imageXLarge ?? null,
    },
  });

  return {
    id: user.id,
    name: user.name,
    lastfmSessionKey: user.lastfmSessionKey,
    lastfmUrl: user.lastfmUrl,
    imageSmall: user.imageSmall,
    imageLarge: user.imageLarge,
    imageXLarge: user.imageXLarge,
  };
}
