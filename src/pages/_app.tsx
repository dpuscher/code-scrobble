import type { AppProps } from 'next/app';
import Head from 'next/head';
import { StyleSheetManager } from 'styled-components';
import BaseStyles from '../components/layout/BaseStyles';
import initNProgress from '../lib/initNProgress';
import { SessionProvider } from '../lib/session';
import type { Session } from '../lib/types';
import NProgressStyles from '../styles/nprogress.styles';

if (typeof window !== 'undefined') initNProgress();

export default function App({ Component, pageProps }: AppProps<{ session?: Session }>) {
  return (
    // Vendor prefixes are still needed for iOS Safari (e.g. -webkit-user-select).
    <StyleSheetManager enableVendorPrefixes>
      <SessionProvider session={pageProps.session ?? null}>
        <BaseStyles />
        <NProgressStyles />
        <Head>
          <title>CodeScrobble ► Easily scrobble VINYL and CD to Last.fm</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </StyleSheetManager>
  );
}
