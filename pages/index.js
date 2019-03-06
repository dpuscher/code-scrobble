import React from 'react';
import Router from 'next/router';
import Scanner from '../components/Scanner';
import CircleLayout from '../components/layout/CircleLayout';

const Scan = () => {
  const codeDetected = ({ codeResult: { code: barcode } }) => {
    Router.push(`/detected?barcode=${barcode}`, `/detected/${barcode}`);
  };

  return (
    <CircleLayout>
      <Scanner onDetected={codeDetected} />
    </CircleLayout>
  );
};

export default Scan;
