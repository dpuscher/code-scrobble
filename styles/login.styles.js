import styled from 'styled-components';
import LogoModule from '../components/Logo';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const H1 = styled.h1`
  margin: 0;
`;

export const P = styled.p`
  margin: 30px 0;
`;

export const Description = styled.div`
  max-width: 600px;
  padding: 0 30px;
`;

export const Logo = styled(LogoModule)`
  width: 300px;
  height: auto;
`;
