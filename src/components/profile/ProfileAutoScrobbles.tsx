import { FaRegTrashAlt } from 'react-icons/fa';
import { useAutoScrobbles } from '../../lib/api';
import { InlineSpinner } from '../layout/Spinner';
import {
  Fallback, List, ListItem, Row, SectionHeading, SectionMeta,
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
            id, artist, title, year, image,
          }) => (
            <ListItem key={id}>
              <Row image={image} title={title} details={[artist, year].filter(Boolean).join(' · ')} />
              <button
                type="button"
                onClick={() => remove(id)}
                aria-label={`Remove ${artist} - ${title}`}
                className="flex-none self-stretch px-5 opacity-60 transition-[opacity,color,scale] hover:text-lastfm hover:opacity-100 active:scale-90"
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
