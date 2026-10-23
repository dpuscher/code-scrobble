import ProfileAutoScrobbles from '../../components/profile/ProfileAutoScrobbles';
import ProfileHistory from '../../components/profile/ProfileHistory';
import BackButton from '../../components/ui/BackButton';
import { requireUser } from '../../server/session';
import { listAutoScrobbles, listHistory } from '../../server/users';

export default async function ProfilePage() {
  const user = await requireUser();
  const [autoScrobbles, history] = await Promise.all([listAutoScrobbles(user.id), listHistory(user.id)]);
  return (
    <div className="m-auto w-full max-w-[768px] px-5 pt-[calc(72px+env(safe-area-inset-top))] pb-[calc(20px+env(safe-area-inset-bottom))] leading-[1.4] break-words">
      <BackButton />
      <h1 className="mb-6 text-[2em] font-bold">Profile</h1>
      <header className="flex items-center">
        {user.imageLarge && <img src={user.imageLarge} alt="" className="size-20 flex-none rounded-full ring-2 ring-white/10" />}
        <h2 className="min-w-0 truncate pl-5 text-[1.5em] font-bold">{user.name}</h2>
      </header>
      <ProfileAutoScrobbles autoScrobbles={autoScrobbles} />
      <ProfileHistory history={history.map(({ time, ...item }) => ({ ...item, time: time.toISOString() }))} />
    </div>
  );
}
