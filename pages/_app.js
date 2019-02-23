import App, { Container } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { Provider } from 'unstated';
import { releaseState } from '../app/states/ReleaseState';

export default class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <Provider inject={[releaseState]}>
          <Head>
            <title>CodeScrobble ► Easily scrobble VINYL and CD to Last.fm</title>
          </Head>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}
