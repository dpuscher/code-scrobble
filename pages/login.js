import React from 'react';
import Link from 'next/link';

import LoginButton from '../components/LoginButton';
import { Center } from '../styles/layout.styles';
import {
  Description, H1, Logo, P, Wrapper,
} from '../styles/login.styles';

const Index = () => (
  <Center min>
    <Wrapper>
      <header>
        <H1><Logo alt="CodeScrobble" /></H1>
      </header>
      <main>
        <Description>
          <P>
            CodeScrobble makes it easy to scrobble your CD or vinyl records to Last.fm.
          </P>
          <P>
            Just use you smartphone camera to scan the barcode, check the result and you
            are done. We also have an auto-scrobble mode, that makes scrobbling even faster.
          </P>
        </Description>
        <Link href="/auth/lastfm" passHref>
          <LoginButton />
        </Link>
      </main>
    </Wrapper>
  </Center>
);

export default Index;
