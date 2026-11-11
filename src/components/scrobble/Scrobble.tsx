import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { sendScrobbles, type Ignored } from '../../lib/scrobble';
import type { Release } from '../../lib/types';
import ErrorMessage from '../layout/ErrorMessage';
import Spinner from '../layout/Spinner';

export type { Ignored };

type Props = {
  release: Release;
  /** The sides or discs to scrobble, null for the default ones. */
  parts?: string[] | null;
  autoScrobble?: boolean;
  /** Save which sides were picked, to pick the same ones next time. */
  remember?: boolean;
  onScrobbled: (ignored?: Ignored) => void;
};

type Failure = { title: string; description?: string };

/** Sends the release to Last.fm as soon as it is shown. */
const Scrobble = ({
  release, parts = null, autoScrobble = false, remember = false, onScrobbled,
}: Props) => {
  const router = useRouter();
  const [failure, setFailure] = useState<Failure | null>(null);
  const started = useRef(false);
  // Tracks that reached Last.fm before a request failed; a retry skips them.
  const sent = useRef(0);

  const send = useCallback(async () => {
    setFailure(null);
    const outcome = await sendScrobbles(release.id, {
      parts, autoScrobble, remember, from: sent.current,
    });
    if (outcome.status === 'login') {
      router.push('/login');
    } else if (outcome.status === 'failed') {
      sent.current = outcome.sent;
      setFailure(outcome);
    } else {
      onScrobbled(outcome.ignored);
    }
  }, [release.id, parts, autoScrobble, remember, onScrobbled, router]);

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
      {/* Shown late: a quick answer goes straight to the next page without a flash. */}
      <div className="h-full w-full animate-appear-late">
        <Spinner className="h-full w-full" />
      </div>
      <div className="absolute bottom-0 left-0 w-full bg-black/50 px-[20%] py-[12%] text-center [text-shadow:0_0_3px_black,0_0_3px_black,0_0_3px_black] backdrop-blur-[10px]">
        <span className="animate-appear-late">Sending data to Last.fm</span>
      </div>
    </div>
  );
};

export default Scrobble;
