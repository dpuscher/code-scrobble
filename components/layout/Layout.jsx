import React from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import BaseStyles from './BaseStyles';

const Layout = ({ children, title }) => (
  <>
    <BaseStyles />

    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>{title}</title>
    </Head>

    {children}

  </>
);

Layout.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};

Layout.defaultProps = {
  children: null,
  title: 'CodeScrobble',
};

export default Layout;
