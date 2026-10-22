import { FaRegTrashAlt } from 'react-icons/fa';
import { useAutoScrobbles } from '../../lib/api';
import { InlineSpinner } from '../layout/Spinner';
import {
  Fallback, List, ListItem, SectionHeading, SectionMeta,
} from './ProfileList';

const ProfileAutoScrobbles = () => {
  const { data, isLoading, remove } = useAutoScrobbles();

  return (
    <section aria-labelledby="auto-scrobbles">
      <SectionHeading id="auto-scrobbles">Auto-scrobbles</SectionHeading>
      <SectionMeta>These items are automatically scrobbled the next time they are scanned</SectionMeta>
      {isLoading ? <InlineSpinner /> : (
        <List>
          {!data?.length && (
            <Fallback>
              No entries found. Activate the option &quot;Auto-scrobble&quot; during your next scan.
            </Fallback>
          )}
          {data?.map(({
            id, artist, title, year,
          }) => (
            <ListItem key={id}>
              <span className="grow py-2.5">
                {`${artist} - ${title}`}
                {year && ` (${year})`}
              </span>
              <button
                type="button"
                onClick={() => remove(id)}
                aria-label={`Remove ${artist} - ${title}`}
                className="relative -right-5 p-[15px]"
              >
                <FaRegTrashAlt size={16} aria-hidden />
              </button>
            </ListItem>
          ))}
        </List>
      )}
    </section>
  );
};

export default ProfileAutoScrobbles;
