import Router from 'next/router';
import QueryRelease from '../components/query/QueryRelease';
import Scanner from '../components/scanner/Scanner';
import CircleLayout from '../components/layout/CircleLayout';
import { requireUser } from '../server/guard';

const codeDetected = ({ codeResult: { code: barcode } }) => {
  Router.push(`/detected/${encodeURIComponent(barcode)}`);
};

const Scan = () => (
  <CircleLayout header={<QueryRelease />}>
    <Scanner onDetected={codeDetected} />
  </CircleLayout>
);

export const getServerSideProps = requireUser();

export default Scan;
