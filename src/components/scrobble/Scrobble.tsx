import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { ApiError, scrobbleRelease } from '../../lib/api';
import { ignoredReason } from '../../lib/ignoredScrobbles';
import type { Release } from '../../lib/types';
import ErrorMessage from '../layout/ErrorMessage';
import Spinner from '../layout/Spinner';

/** Tracks Last.fm ignored although the release was scrobbled. */
export type Ignored = { count: number; code?: number };

type Props = {
  release: Release;
  autoScrobble: boolean;
  onScrobbled: (ignored?: Ignored) => void;
};

type Failure = { title: string; description?: string };

const sentSoFar = (error: unknown) => {
  const body = error instanceof ApiError ? error.body as { sent?: unknown } | undefined : undefined;
  return typeof body?.sent === 'number' ? body.sent : undefined;
};

/** Sends the release to Last.fm as soon as it is shown. */
const Scrobble = ({ release, autoScrobble, onScrobbled }: Props) => {
  const router = useRouter();
  const [failure, setFailure] = useState<Failure | null>(null);
  const started = useRef(false);
  // Tracks that reached Last.fm before a request failed; a retry skips them.
  const sent = useRef(0);

  const send = useCallback(async () => {
    setFailure(null);
    let result;
    try {
      result = await scrobbleRelease(release.id, autoScrobble, sent.current);
    } catch (error) {
      // Last.fm access was revoked: log in again.
      if (error instanceof ApiError && error.status === 401) {
        router.push('/login');
        return;
      }
      sent.current = sentSoFar(error) ?? sent.current;
      setFailure({ title: 'An error occurred while sending data to Last.fm' });
      return;
    }
    const { accepted = 0, ignored = 0, ignoredCode } = result;
    if (ignored > 0 && accepted === 0 && sent.current === 0) {
      setFailure({ title: 'Last.fm ignored this record', description: ignoredReason(ignoredCode) });
      return;
    }
    onScrobbled(ignored > 0 ? { count: ignored, code: ignoredCode } : undefined);
  }, [release.id, autoScrobble, onScrobbled, router]);

  useEffect(() => {
    // Only once, even when React StrictMode mounts the component twice.
    if (started.current) return;
    started.current = true;
    send();
  }, [send]);

  if (failure) {
    return <ErrorMessage title={failure.title} description={failure.description} onRetry={send} />;
  }

  return (
    <div
      className="absolute flex h-full w-full items-center justify-center bg-cover"
      style={release.image ? { backgroundImage: `url("${release.image}")` } : undefined}
    >
      <Spinner className="h-full w-full" />
      <div className="absolute bottom-0 left-0 w-full bg-black/50 px-[20%] py-[12%] text-center [text-shadow:0_0_3px_black,0_0_3px_black,0_0_3px_black] backdrop-blur-[10px]">
        Sending data to Last.fm
      </div>
    </div>
  );
};

export default Scrobble;
