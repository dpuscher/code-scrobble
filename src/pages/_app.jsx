import isPropValid from '@emotion/is-prop-valid';
import Head from 'next/head';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { StyleSheetManager } from 'styled-components';
import BaseStyles from '../components/layout/BaseStyles';
import NProgressStyles from '../styles/nprogress.styles';
import initNProgress from '../lib/initNProgress';
import initializeStore from '../client/reduxStore';

if (typeof window !== 'undefined') initNProgress();

// styled-components v6 forwards every prop to the DOM; keep the v5 behaviour
// of only forwarding valid HTML attributes.
const shouldForwardProp = (prop, target) => (
  typeof target === 'string' ? isPropValid(prop) : true
);

export default function App({ Component, pageProps }) {
  const [store] = useState(() => initializeStore(
    pageProps.session ? { session: { data: pageProps.session } } : {},
  ));

  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp} enableVendorPrefixes>
      <Provider store={store}>
        <BaseStyles />
        <NProgressStyles />
        <Head>
          <title>CodeScrobble ► Easily scrobble VINYL and CD to Last.fm</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </Head>
        <Component {...pageProps} />
      </Provider>
    </StyleSheetManager>
  );
}
