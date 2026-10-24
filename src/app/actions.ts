'use server';

// Server actions: mutations called from the client. Next.js checks that
// they come from this site (Origin and Host must match).

import { revalidatePath } from 'next/cache';
import { isSearchFormat, type SearchFormat } from '../lib/formats';
import type { ScrobbleRequest, ScrobbleResponse } from '../lib/types';
import { scrobbleRelease } from '../server/scrobble';
import { currentUser } from '../server/session';
import { removeAutoScrobble as removeAutoScrobbleOf, setSearchFormat } from '../server/users';

export async function scrobble(request: ScrobbleRequest): Promise<ScrobbleResponse> {
  const user = await currentUser();
  if (!user) return { status: 'login' };
  return scrobbleRelease(user, request);
}

/** The format the release search is narrowed to; null for all. */
export async function saveSearchFormat(format: SearchFormat | null) {
  const user = await currentUser();
  if (!user || (format !== null && !isSearchFormat(format))) return;
  await setSearchFormat(user.id, format);
}

export async function removeAutoScrobble(releaseId: number) {
  const user = await currentUser();
  if (!user || !Number.isInteger(releaseId)) return;
  await removeAutoScrobbleOf(user.id, releaseId);
  revalidatePath('/profile');
}
