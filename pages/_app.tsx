import React from 'react';
import Head from 'next/head';
import { Provider } from 'react-redux';
import BaseStyles from '../components/layout/BaseStyles';
import NProgressStyles from '../styles/nprogress.styles';
import initNProgress from '../lib/initNProgress';
import { wrapper } from '../client/reduxStore';

initNProgress();

function MyApp({ Component, pageProps }) {
  const { store, props } = wrapper.useWrappedStore(pageProps);

  return (
    <Provider store={store}>
      <BaseStyles />
      <NProgressStyles />
      <Head>
        <title>CodeScrobble ► Easily scrobble VINYL and CD to Last.fm</title>
      </Head>
      <Component {...props.pageProps} />
    </Provider>
  );
}

export default MyApp;
