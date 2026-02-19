import React from 'react';
import Router from 'next/router';
import QueryRelease from '../components/query/QueryRelease';
import Scanner from '../components/scanner/Scanner';
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
