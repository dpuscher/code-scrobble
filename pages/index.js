import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import Scanner from '../components/Scanner';
import CircleLayout from '../components/layout/CircleLayout';

const Scan = () => {
  const codeDetected = ({ codeResult: { code: barcode } }) => {
    Router.push(`/detected?barcode=${barcode}`, `/detected/${barcode}`);
  };

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://lastfm-img2.akamaized.net" />
      </Head>
      <CircleLayout>
        <Scanner onDetected={codeDetected} />
      </CircleLayout>
    </>
  );
};

export default Scan;
