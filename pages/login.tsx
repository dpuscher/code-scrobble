import React from 'react';

import LegalLinks from '../components/ui/LegalLinks';
import LoginButton from '../components/ui/LoginButton';
import { Center } from '../styles/layout.styles';
import {
  Description, H1, Logo, P, Wrapper,
} from '../styles/login.styles';
import { autotrackParams } from '../lib/analytics';

const Index = () => (
  <Center useMinHeight>
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
        <LoginButton href="/auth/lastfm" {...autotrackParams('Session', 'Login')} />
      </main>
    </Wrapper>
    <LegalLinks />
  </Center>
);

export default Index;
