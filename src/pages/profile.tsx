import ProfileAutoScrobbles from '../components/profile/ProfileAutoScrobbles';
import ProfileHistory from '../components/profile/ProfileHistory';
import BackButton from '../components/ui/BackButton';
import { useSession } from '../lib/session';
import { requireUser } from '../server/guard';
import {
  H1, H2, Header, ProfileImg, Wrapper,
} from '../styles/profile.styles';

const Profile = () => {
  const session = useSession();
  return (
    <Wrapper>
      <BackButton />
      <H1>Profile</H1>
      <Header>
        {session?.imageLarge && <ProfileImg src={session.imageLarge} alt="" />}
        <H2>{session?.name}</H2>
      </Header>
      <ProfileAutoScrobbles />
      <ProfileHistory />
    </Wrapper>
  );
};

export const getServerSideProps = requireUser();

export default Profile;
