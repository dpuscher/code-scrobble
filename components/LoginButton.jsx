import LastfmIcon from './icons/LastfmIcon';
import { Caption, Wrapper } from './styles/LoginButton.styles';

const LoginButton = props => (
  <Wrapper title="Login with Last.fm" {...props}>
    <Caption>Login with</Caption>
    <LastfmIcon alt="Last.fm" />
  </Wrapper>
);

export default LoginButton;
