import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import CircleLayout, { FooterContent } from '../../components/layout/CircleLayout';
import ErrorMessage from '../../components/layout/ErrorMessage';
import Loading from '../../components/layout/Loading';
import ReleaseActions from '../../components/release/ReleaseActions';
import ReleaseInfo from '../../components/release/ReleaseInfo';
import Scrobble from '../../components/scrobble/Scrobble';
import Checkbox from '../../components/ui/Checkbox';
import { useFreshRelease } from '../../lib/api';
import { requireUser } from '../../server/guard';

/** Shows the release for a scanned barcode (or `id:<discogs id>`). */
const Detected = ({ barcode }: { barcode: string }) => {
  const router = useRouter();
  const { release, isLoading, failed } = useFreshRelease(barcode);
  const [autoScrobble, setAutoScrobble] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  // Releases marked for auto-scrobbling skip the confirmation.
  const scrobbling = confirmed || Boolean(release?.instantScrobble);

  const rescan = () => router.push('/');
  const onScrobbled = useCallback(() => {
    router.push(`/scrobbled/${encodeURIComponent(barcode)}`);
  }, [router, barcode]);

  const showRelease = release && !scrobbling;

  let content;
  if (isLoading) {
    content = <Loading />;
  } else if (failed || !release) {
    content = <ErrorMessage title={<>No release found<br />{barcode}</>} onRetry={rescan} />;
  } else if (scrobbling) {
    content = <Scrobble release={release} autoScrobble={autoScrobble} onScrobbled={onScrobbled} />;
  } else {
    content = <ReleaseActions release={release} onScrobble={() => setConfirmed(true)} onCancel={rescan} />;
  }

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://i.discogs.com" />
      </Head>
      <CircleLayout
        header={showRelease && <ReleaseInfo release={release} />}
        footer={showRelease && (
          <FooterContent>
            <Checkbox name="autoScrobble" checked={autoScrobble} onChange={setAutoScrobble}>
              Auto-scrobble on next scan
            </Checkbox>
          </FooterContent>
        )}
      >
        {content}
      </CircleLayout>
    </>
  );
};

export const getServerSideProps = requireUser(({ params }) => ({ barcode: String(params?.barcode) }));

export default Detected;
