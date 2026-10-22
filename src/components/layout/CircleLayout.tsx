import Link from 'next/link';
import type { ReactNode } from 'react';
import { createGlobalStyle } from 'styled-components';
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

type Props = {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

/** The app shell: logo and session on top, the round content area, footer. */
const CircleLayout = ({ children, header, footer }: Props) => (
  <Center>
    <ScrollLock />
    <Wrapper>
      <Header>
        <SessionWrapper>
          <Session />
        </SessionWrapper>
        <LogoWrapper>
          <Link href="/" aria-label="Scan">
            <Logo />
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

export default CircleLayout;
