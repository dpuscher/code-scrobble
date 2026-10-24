import { SessionProvider } from '../lib/session';
import { requireUser } from '../server/session';
import { toSessionJSON } from '../server/users';
import Scan from './Scan';

export default async function ScanPage() {
  const user = await requireUser();
  return (
    <SessionProvider session={toSessionJSON(user)}>
      <Scan />
    </SessionProvider>
  );
}
