import { ApiError, scrobbleRelease } from './api';
import { ignoredReason } from './ignoredScrobbles';

/** Tracks Last.fm ignored although the release was scrobbled. */
export type Ignored = { count: number; code?: number };

export type ScrobbleOutcome =
  | { status: 'scrobbled'; ignored?: Ignored }
  /** Last.fm access was revoked: log in again. */
  | { status: 'login' }
  /** `sent` tracks reached Last.fm before it failed; a retry skips them. */
  | { status: 'failed'; title: string; description?: string; sent: number };

type Options = {
  /** The sides or discs to scrobble, null for the default ones. */
  parts?: string[] | null;
  autoScrobble?: boolean;
  /** Save which sides were picked, to pick the same ones next time. */
  remember?: boolean;
  /** Tracks an earlier attempt already sent. */
  from?: number;
};

const sentSoFar = (error: unknown) => {
  const body = error instanceof ApiError ? error.body as { sent?: unknown } | undefined : undefined;
  return typeof body?.sent === 'number' ? body.sent : undefined;
};

/** Scrobbles a release and sums up how it went. */
export async function sendScrobbles(id: number, options: Options = {}): Promise<ScrobbleOutcome> {
  const from = options.from ?? 0;
  let result;
  try {
    result = await scrobbleRelease(id, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: 'login' };
    return { status: 'failed', title: 'An error occurred while sending data to Last.fm', sent: sentSoFar(error) ?? from };
  }
  const { accepted = 0, ignored = 0, ignoredCode } = result;
  if (ignored > 0 && accepted === 0 && from === 0) {
    return {
      status: 'failed', title: 'Last.fm ignored this record', description: ignoredReason(ignoredCode), sent: 0,
    };
  }
  return { status: 'scrobbled', ...(ignored > 0 ? { ignored: { count: ignored, code: ignoredCode } } : {}) };
}
