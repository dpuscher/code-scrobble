import Link from 'next/link';
import TimeAgo from 'react-timeago';
import { useHistory } from '../../lib/api';
import { InlineSpinner } from '../layout/Spinner';
import {
  Cover, Fallback, List, ListItem, SectionHeading, SectionMeta,
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
                className="-mx-5 flex grow items-center px-5 py-2.5 transition-colors hover:bg-white/5 active:bg-white/10"
              >
                <Cover src={image} />
                <span>
                  <span className="mr-[1em]">
                    {`${artist} - ${title}`}
                    {year && ` (${year})`}
                  </span>
                  <span className="inline-block text-[12px] whitespace-nowrap opacity-50">
                    <TimeAgo date={time} />
                  </span>
                </span>
              </Link>
            </ListItem>
          ))}
        </List>
      )}
    </section>
  );
};

export default ProfileHistory;
