import styled from 'styled-components';
import { grey } from '../lib/colors';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100%;
`;

export const Header = styled.div`
  flex: 1 1;
`;

export const Footer = styled.div`
  display: flex;
  flex: 1 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

export const FooterContent = styled.div`
  width: 500px;
  max-width: 80%;
  margin: 0 auto;
  padding-top: 20px;
`;

export const Content = styled.div`
  position: relative;
  flex: 0 0 auto;
  width: 500px;
  max-width: 80%;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: ${grey};
  mask-image: radial-gradient(white, black);
`;

export const HeightWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;
