'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import CircleLayout, { FooterContent } from '../components/layout/CircleLayout';
import QueryRelease from '../components/query/QueryRelease';
import Scanner from '../components/scanner/Scanner';

const Scan = () => {
  const router = useRouter();
  const [searching, setSearching] = useState(false);
  return (
    <CircleLayout
      header={<QueryRelease onOpenChange={setSearching} />}
      footer={(
        <FooterContent>
          <p className="text-center opacity-60">Point your camera at the barcode of a CD or record</p>
        </FooterContent>
      )}
    >
      <Scanner paused={searching} onDetected={(barcode) => router.push(`/detected/${encodeURIComponent(barcode)}`)} />
    </CircleLayout>
  );
};

export default Scan;
