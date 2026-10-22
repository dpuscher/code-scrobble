import Link from 'next/link';
import TimeAgo from 'react-timeago';
import { useHistory } from '../../lib/api';
import { InlineSpinner } from '../layout/Spinner';
import {
  Fallback, List, ListItem, Row, SectionHeading, SectionMeta,
} from './ProfileList';

const ProfileHistory = () => {
  const { data, isLoading } = useHistory();

  return (
    <section aria-labelledby="history">
      <SectionHeading id="history">History</SectionHeading>
      <SectionMeta>Your recently scanned items. Tap one to scrobble it again.</SectionMeta>
      {isLoading ? <InlineSpinner /> : (
        <List>
          {!data?.length && <Fallback>No entries found.</Fallback>}
          {data?.map(({
            id, artist, title, year, image, barcode, discogsId, time,
          }) => (
            <ListItem key={id}>
              <Link
                href={`/detected/${encodeURIComponent(barcode || `id:${discogsId}`)}`}
                className="flex min-w-0 grow pr-5 transition-colors hover:bg-white/5 active:bg-white/10"
              >
                <Row
                  image={image}
                  title={title}
                  details={(
                    <>
                      {[artist, year].filter(Boolean).join(' · ')}
                      {' · '}
                      <TimeAgo date={time} />
                    </>
                  )}
                />
              </Link>
            </ListItem>
          ))}
        </List>
      )}
    </section>
  );
};

export default ProfileHistory;
