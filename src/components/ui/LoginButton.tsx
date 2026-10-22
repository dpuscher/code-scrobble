import LastfmIcon from '../icons/LastfmIcon';
import { Caption, Wrapper } from './styles/LoginButton.styles';

const LoginButton = ({ href }: { href: string }) => (
  <Wrapper href={href} title="Login with Last.fm">
    <Caption>Login with</Caption>
    <LastfmIcon aria-hidden="true" />
  </Wrapper>
);

export default LoginButton;
