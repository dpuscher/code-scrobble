import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { ApiError, scrobbleRelease } from '../../lib/api';
import type { Release } from '../../lib/types';
import ErrorMessage from '../layout/ErrorMessage';
import { Loading, LoadingContent, LoadingWrapper } from './styles/Scrobble.styles';

type Props = {
  release: Release;
  autoScrobble: boolean;
  onScrobbled: () => void;
};

/** Sends the release to Last.fm as soon as it is shown. */
const Scrobble = ({ release, autoScrobble, onScrobbled }: Props) => {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const sent = useRef(false);

  const send = useCallback(async () => {
    setFailed(false);
    try {
      await scrobbleRelease(release.id, autoScrobble);
    } catch (error) {
      // Last.fm access was revoked: log in again.
      if (error instanceof ApiError && error.status === 401) router.push('/login');
      else setFailed(true);
      return;
    }
    onScrobbled();
  }, [release.id, autoScrobble, onScrobbled, router]);

  useEffect(() => {
    // Only once, even when React StrictMode mounts the component twice.
    if (sent.current) return;
    sent.current = true;
    send();
  }, [send]);

  if (failed) {
    return <ErrorMessage title="An error occurred while sending data to Last.fm" onRetry={send} />;
  }

  return (
    <LoadingWrapper $image={release.image}>
      <Loading />
      <LoadingContent>Sending data to Last.fm</LoadingContent>
    </LoadingWrapper>
  );
};

export default Scrobble;
