import React from 'react';
import Router from 'next/router';
import QueryRelease from '../components/QueryRelease';
import Scanner from '../components/Scanner';
import CircleLayout from '../components/layout/CircleLayout';

const codeDetected = ({ codeResult: { code: barcode } }) => {
  Router.push(`/detected?barcode=${barcode}`, `/detected/${barcode}`);
};

const Scan = () => (
  <CircleLayout header={<QueryRelease />}>
    <Scanner onDetected={codeDetected} />
  </CircleLayout>
);

export default Scan;
