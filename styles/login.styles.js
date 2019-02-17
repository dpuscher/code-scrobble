import styled from 'styled-components';
import LogoModule from '../components/Logo';
import LoginButtonModule from '../components/icons/LoginButton';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const Description = styled.div`
  max-width: 600px;
  padding: 30px;
`;

export const Logo = styled(LogoModule)`
  width: 300px;
  height: auto;
`;

export const LoginButton = styled(LoginButtonModule)`
  width: 150px;
  height: 57px;
`;
