import styled from 'styled-components';
import { grey } from '../lib/colors';

export const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  ${props => (props.useMinHeight ? 'min-height: 100%' : 'height: 100%')};
  padding: 15px 0;
`;

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

export const FlexContent = styled.div`
  display: flex;
  position: absolute;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10%;
  text-align: center;
`;

export const HeightWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;

export const FooterContent = styled.div`
  width: 500px;
  max-width: 80%;
  margin: 0 auto;
  padding-top: 20px;
`;

export const SessionWrapper = styled.div`
  position: absolute;
  z-index: 1;
  top: 20px;
  right: 20px;
`;
