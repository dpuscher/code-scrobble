import React from 'react';
import Link from 'next/link';

import Layout from '../components/layout/Layout';
import { Center } from '../styles/layout.styles';
import {
  Description, LoginButton, Logo, Wrapper,
} from '../styles/login.styles';

const Index = () => (
  <Layout>
    <Center>
      <Wrapper>
        <Logo />
        <Description>
          CodeScrobbler ermöglicht es, mit einfachem Abscannen des Barcodes einer
          CD oder einer Vinyl diesen Tonträger auf Last.fm zu scrobbeln:
        </Description>
        <Link href="/auth/lastfm">
          <a><LoginButton /></a>
        </Link>
      </Wrapper>
    </Center>
  </Layout>
);

export default Index;
