import { useRouter } from 'next/router';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import CircleLayout from '../../components/layout/CircleLayout';
import { RetryButton } from '../../components/layout/styles/Error.styles';
import { useRelease } from '../../lib/api';
import { yellow } from '../../lib/colors';
import { requireUser } from '../../server/guard';
import { FlexContent } from '../../styles/layout.styles';
import { CoverBackground, Message } from '../../styles/scrobbled.styles';

const Scrobbled = ({ barcode }: { barcode: string }) => {
  const router = useRouter();
  const { release } = useRelease(barcode);

  return (
    <CircleLayout>
      <FlexContent role="status">
        {release?.image && <CoverBackground $image={release.image} />}
        <FaCheckCircle color={yellow} size="50px" aria-hidden />
        <Message>Record successfully scrobbled to Last.fm</Message>
        <RetryButton type="button" onClick={() => router.push('/')}>
          <IoMdQrScanner size="30px" aria-hidden />
          Scan another code
        </RetryButton>
      </FlexContent>
    </CircleLayout>
  );
};

export const getServerSideProps = requireUser(({ params }) => ({ barcode: String(params?.barcode) }));

export default Scrobbled;
