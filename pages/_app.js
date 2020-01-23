import App from 'next/app';
import Head from 'next/head';
import React from 'react';
import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import BaseStyles from '../components/layout/BaseStyles';
import NProgressStyles from '../styles/nprogress.styles';
import initNProgress from '../lib/initNProgress';
import initializeStore from '../client/reduxStore';

initNProgress();

class MyApp extends App {
  render() {
    const { Component, pageProps, store } = this.props;

    return (
      <Provider store={store}>
        <BaseStyles />
        <NProgressStyles />
        <Head>
          <title>CodeScrobble ► Easily scrobble VINYL and CD to Last.fm</title>
        </Head>
        <Component {...pageProps} />
      </Provider>
    );
  }
}

export default withRedux(initializeStore)(MyApp);
