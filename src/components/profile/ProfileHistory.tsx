import Link from 'next/link';
import { useHistory } from '../../lib/api';
import {
  Fallback, H3, List, ListCaption, ListItem, Meta, Time, TimeCaption,
} from '../../styles/profile.styles';
import { InlineSpinner } from '../layout/Spinner';

const ProfileHistory = () => {
  const { data, isLoading } = useHistory();

  return (
    <section aria-labelledby="history">
      <H3 id="history">History</H3>
      <Meta>Your recently scanned items. Tap one to scrobble it again.</Meta>
      {isLoading ? <InlineSpinner /> : (
        <List>
          {!data?.length && <Fallback>No entries found.</Fallback>}
          {data?.map(({
            id, artist, title, year, barcode, discogsId, time,
          }) => (
            <ListItem key={id}>
              <ListCaption as={Link} href={`/detected/${encodeURIComponent(barcode || `id:${discogsId}`)}`}>
                <TimeCaption>
                  {`${artist} - ${title}`}
                  {year && ` (${year})`}
                </TimeCaption>
                <Time date={time} />
              </ListCaption>
            </ListItem>
          ))}
        </List>
      )}
    </section>
  );
};

export default ProfileHistory;
