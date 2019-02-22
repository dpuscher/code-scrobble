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
          CodeScrobbler makes it easy to scan the barcode of
          a CD or vinyl to scrobble this record on Last.fm
        </Description>
        <Link href="/auth/lastfm">
          <a><LoginButton /></a>
        </Link>
      </Wrapper>
    </Center>
  </Layout>
);

export default Index;
