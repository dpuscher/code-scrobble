import { useRouter } from 'next/router';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import CircleLayout, { CircleContent } from '../../components/layout/CircleLayout';
import RoundButton from '../../components/layout/RoundButton';
import { useRelease } from '../../lib/api';
import { requireUser } from '../../server/guard';

const Scrobbled = ({ barcode }: { barcode: string }) => {
  const router = useRouter();
  const { release } = useRelease(barcode);

  return (
    <CircleLayout>
      <CircleContent role="status">
        {release?.image && (
          <div
            className="absolute -z-1 h-full w-full bg-cover opacity-50 blur-[20px]"
            style={{ backgroundImage: `url("${release.image}")` }}
          />
        )}
        <FaCheckCircle size="50px" aria-hidden className="text-yellow" />
        <div className="mx-[30px] mt-[30px]">Record successfully scrobbled to Last.fm</div>
        <RoundButton onClick={() => router.push('/')}>
          <IoMdQrScanner size="30px" aria-hidden />
          Scan another code
        </RoundButton>
      </CircleContent>
    </CircleLayout>
  );
};

export const getServerSideProps = requireUser(({ params }) => ({ barcode: String(params?.barcode) }));

export default Scrobbled;
