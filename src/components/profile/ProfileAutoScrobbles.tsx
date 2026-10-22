import { FaRegTrashAlt } from 'react-icons/fa';
import { useAutoScrobbles } from '../../lib/api';
import {
  DeleteButton, Fallback, H3, List, ListCaption, ListItem, Meta,
} from '../../styles/profile.styles';
import { InlineSpinner } from '../layout/Spinner';

const ProfileAutoScrobbles = () => {
  const { data, isLoading, remove } = useAutoScrobbles();

  return (
    <section aria-labelledby="auto-scrobbles">
      <H3 id="auto-scrobbles">Auto-scrobbles</H3>
      <Meta>These items are automatically scrobbled the next time they are scanned</Meta>
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
              <ListCaption>
                {`${artist} - ${title}`}
                {year && ` (${year})`}
              </ListCaption>
              <DeleteButton type="button" onClick={() => remove(id)} aria-label={`Remove ${artist} - ${title}`}>
                <FaRegTrashAlt size={16} aria-hidden />
              </DeleteButton>
            </ListItem>
          ))}
        </List>
      )}
    </section>
  );
};

export default ProfileAutoScrobbles;
