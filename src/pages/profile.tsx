import ProfileAutoScrobbles from '../components/profile/ProfileAutoScrobbles';
import ProfileHistory from '../components/profile/ProfileHistory';
import BackButton from '../components/ui/BackButton';
import { useSession } from '../lib/session';
import { requireUser } from '../server/guard';

const Profile = () => {
  const session = useSession();
  return (
    <div className="m-auto w-full max-w-[768px] px-5 pt-[calc(72px+env(safe-area-inset-top))] pb-[calc(20px+env(safe-area-inset-bottom))] leading-[1.4] break-words">
      <BackButton />
      <h1 className="mb-5 text-[2em] font-bold">Profile</h1>
      <header className="flex items-center">
        {session?.imageLarge && <img src={session.imageLarge} alt="" className="size-[87px] flex-[0_0_87px] rounded-full ring-2 ring-white/10" />}
        <h2 className="pl-[30px] text-[1.5em] font-bold">{session?.name}</h2>
      </header>
      <ProfileAutoScrobbles />
      <ProfileHistory />
    </div>
  );
};

export const getServerSideProps = requireUser();

export default Profile;
