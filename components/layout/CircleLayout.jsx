import { createGlobalStyle } from 'styled-components';
import PropTypes from 'prop-types';
import {
  Center, Content, Footer, Header, HeightWrapper, Logo, LogoWrapper, SessionWrapper, Wrapper,
} from '../../styles/layout.styles';
import LegalLinks from '../LegalLinks';
import Session from '../Session';
import SessionQuery from '../SessionQuery';

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
          <SessionQuery>{props => <Session {...props} />}</SessionQuery>
        </SessionWrapper>
        <LogoWrapper>
          <Logo />
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
