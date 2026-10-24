import { Suspense } from 'react';
import { preconnect, preload } from 'react-dom';
import CircleLayout from '../../../components/layout/CircleLayout';
import Loading from '../../../components/layout/Loading';
import { SessionProvider } from '../../../lib/session';
import { findReleaseFor } from '../../../server/releases';
import { requireUser } from '../../../server/session';
import { toSessionJSON } from '../../../server/users';
import Detected from './Detected';

type Props = { params: Promise<{ barcode: string }> };

async function DetectedRelease({ code, userId }: { code: string; userId: number }) {
  const release = await findReleaseFor(code, userId);
  if (release?.image) preload(release.image, { as: 'image' });
  return <Detected barcode={code} release={release} />;
}

/** The release for a scanned barcode; looking it up on Discogs may take a moment. */
export default async function DetectedPage({ params }: Props) {
  const user = await requireUser();
  // Page params come URL-encoded (id%3A42), unlike those of route handlers.
  const code = decodeURIComponent((await params).barcode);
  // Cover art comes from the Discogs CDN.
  preconnect('https://i.discogs.com');
  return (
    <SessionProvider session={toSessionJSON(user)}>
      <Suspense fallback={<CircleLayout><Loading /></CircleLayout>}>
        <DetectedRelease code={code} userId={user.id} />
      </Suspense>
    </SessionProvider>
  );
}
