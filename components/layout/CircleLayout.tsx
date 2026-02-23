import React from "react";
import { createGlobalStyle } from "styled-components";
import Link from "next/link";
import {
  Center,
  Content,
  Footer,
  Header,
  HeightWrapper,
  Logo,
  LogoWrapper,
  SessionWrapper,
  Wrapper,
} from "../../styles/layout.styles";
import Session from "../session/Session";
import LegalLinks from "../ui/LegalLinks";

const ScrollLock = createGlobalStyle`
  body {
    position: fixed;
    width: 100%;
    overflow: hidden;
  }
`;

interface CircleLayoutProps {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const CircleLayout = ({ children = null, header = null, footer = null }: CircleLayoutProps) => (
  <Center>
    <ScrollLock />
    <Wrapper>
      <Header>
        <SessionWrapper>
          <Session />
        </SessionWrapper>
        <LogoWrapper>
          <Link href="/">
            <Logo />
          </Link>
        </LogoWrapper>
        {header}
      </Header>
      <Content>
        <HeightWrapper>{children}</HeightWrapper>
      </Content>
      <Footer>
        <LegalLinks />
        {footer}
      </Footer>
    </Wrapper>
  </Center>
);

export default CircleLayout;
