import { useRouter } from 'next/router';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import CircleLayout, { CircleContent } from '../../components/layout/CircleLayout';
import RoundButton from '../../components/layout/RoundButton';
import { useRelease } from '../../lib/api';
import { ignoredReason } from '../../lib/ignoredScrobbles';
import { requireUser } from '../../server/guard';

type Props = {
  barcode: string;
  /** Tracks Last.fm ignored, and its reason code. */
  ignored: number;
  reason: number | null;
};

const Scrobbled = ({ barcode, ignored, reason }: Props) => {
  const router = useRouter();
  const { release } = useRelease(barcode);

  return (
    <CircleLayout>
      <CircleContent role="status">
        {release?.image && (
          <div
            className="absolute -z-1 h-full w-full bg-cover opacity-50 blur-[20px] after:absolute after:inset-0 after:bg-dark/50"
            style={{ backgroundImage: `url("${release.image}")` }}
          />
        )}
        <FaCheckCircle size="50px" aria-hidden className="text-yellow motion-safe:animate-pop-in" />
        {ignored > 0 ? (
          <div className="mx-[30px] mt-[30px] text-white">
            <div className="font-normal">Record scrobbled to Last.fm</div>
            <p className="mt-2 text-[13px] text-silver">
              {`Last.fm ignored ${ignored} ${ignored === 1 ? 'track' : 'tracks'}.`}
              {' '}
              {ignoredReason(reason ?? undefined)}
            </p>
          </div>
        ) : (
          <div className="mx-[30px] mt-[30px] font-normal text-white">Record successfully scrobbled to Last.fm</div>
        )}
        <RoundButton onClick={() => router.push('/')}>
          <IoMdQrScanner size="30px" aria-hidden />
          Scan another code
        </RoundButton>
      </CircleContent>
    </CircleLayout>
  );
};

export const getServerSideProps = requireUser(({ params, query }) => ({
  barcode: String(params?.barcode),
  ignored: Math.max(Number(query.ignored) || 0, 0),
  reason: Number(query.reason) || null,
}));

export default Scrobbled;
