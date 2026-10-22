import { useRouter } from 'next/router';
import CircleLayout, { FooterContent } from '../components/layout/CircleLayout';
import QueryRelease from '../components/query/QueryRelease';
import Scanner from '../components/scanner/Scanner';
import { requireUser } from '../server/guard';

const Scan = () => {
  const router = useRouter();
  return (
    <CircleLayout
      header={<QueryRelease />}
      footer={(
        <FooterContent>
          <p className="text-center opacity-60">Point your camera at the barcode of a CD or record</p>
        </FooterContent>
      )}
    >
      <Scanner onDetected={(barcode) => router.push(`/detected/${encodeURIComponent(barcode)}`)} />
    </CircleLayout>
  );
};

export const getServerSideProps = requireUser();

export default Scan;
