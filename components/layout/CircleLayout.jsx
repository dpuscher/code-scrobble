import { createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import Link from 'next/link';
import {
  Center, Content, Footer, Header, HeightWrapper, Logo, LogoWrapper, SessionWrapper, Wrapper,
} from '../../styles/layout.styles';
import Session from '../session/Session';
import LegalLinks from '../ui/LegalLinks';

const ScrollLock = createGlobalStyle`
  body {
    position: fixed;
    width: 100%;
    overflow: hidden;
  }
`;

const CircleLayout = ({ children, header, footer }) => (
  <Center>
    <ScrollLock />
    <Wrapper>
      <Header>
        <SessionWrapper>
          <Session />
        </SessionWrapper>
        <LogoWrapper>
          <Link href="/">
            <a><Logo /></a>
          </Link>
        </LogoWrapper>
        {header}
      </Header>
      <Content>
        <HeightWrapper>
          {children}
        </HeightWrapper>
      </Content>
      <Footer>
        <LegalLinks />
        {footer}
      </Footer>
    </Wrapper>
  </Center>
);

CircleLayout.propTypes = {
  children: PropTypes.any,
  header: PropTypes.any,
  footer: PropTypes.any,
};

CircleLayout.defaultProps = {
  children: null,
  header: null,
  footer: null,
};

export default CircleLayout;
