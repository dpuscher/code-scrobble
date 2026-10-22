import type { AppProps } from 'next/app';
import Head from 'next/head';
import initNProgress from '../lib/initNProgress';
import { SessionProvider } from '../lib/session';
import type { Session } from '../lib/types';
import '../styles/globals.css';

if (typeof window !== 'undefined') initNProgress();

export default function App({ Component, pageProps }: AppProps<{ session?: Session }>) {
  return (
    <SessionProvider session={pageProps.session ?? null}>
      <Head>
        <title>CodeScrobble ► Easily scrobble VINYL and CD to Last.fm</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}
