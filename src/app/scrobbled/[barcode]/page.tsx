import { SessionProvider } from '../../../lib/session';
import { findRelease, toReleaseJSON } from '../../../server/releases';
import { requireUser } from '../../../server/session';
import { toSessionJSON } from '../../../server/users';
import Scrobbled from './Scrobbled';

type Props = {
  params: Promise<{ barcode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ScrobbledPage({ params, searchParams }: Props) {
  const user = await requireUser();
  // Page params come URL-encoded (id%3A42), unlike those of route handlers.
  const code = decodeURIComponent((await params).barcode);
  const query = await searchParams;
  // Already in the database: it was just scrobbled.
  const release = await findRelease(code).catch(() => null);
  return (
    <SessionProvider session={toSessionJSON(user)}>
      <Scrobbled
        barcode={code}
        release={release && toReleaseJSON(release)}
        parts={typeof query.parts === 'string' && query.parts ? query.parts.split(',') : null}
        ignored={Math.max(Number(query.ignored) || 0, 0)}
        reason={Number(query.reason) || null}
      />
    </SessionProvider>
  );
}
