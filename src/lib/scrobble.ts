import { scrobble } from '../app/actions';
import { ignoredReason } from './ignoredScrobbles';
import type { ScrobbleRequest } from './types';

/** Tracks Last.fm ignored although the release was scrobbled. */
export type Ignored = { count: number; code?: number };

export type ScrobbleOutcome =
  | { status: 'scrobbled'; ignored?: Ignored }
  /** Last.fm access was revoked: log in again. */
  | { status: 'login' }
  /** `sent` tracks reached Last.fm before it failed; a retry skips them. */
  | { status: 'failed'; title: string; description?: string; sent: number };

const failed = (sent: number) => ({ status: 'failed', title: 'An error occurred while sending data to Last.fm', sent } as const);

/** Scrobbles a release and sums up how it went. */
export async function sendScrobbles(request: ScrobbleRequest): Promise<ScrobbleOutcome> {
  const from = request.from ?? 0;
  let response;
  try {
    response = await scrobble(request);
  } catch {
    return failed(from);
  }
  if (response.status === 'login') return response;
  if (response.status === 'failed') return failed(response.sent);
  if (response.status === 'invalid') return failed(from);

  const { accepted, ignored, ignoredCode } = response;
  if (ignored > 0 && accepted === 0 && from === 0) {
    return {
      status: 'failed', title: 'Last.fm ignored this record', description: ignoredReason(ignoredCode), sent: 0,
    };
  }
  return { status: 'scrobbled', ...(ignored > 0 ? { ignored: { count: ignored, code: ignoredCode } } : {}) };
}
