'use client';

import { useOptimistic, useTransition } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { removeAutoScrobble } from '../../app/actions';
import type { AutoScrobble } from '../../lib/types';
import {
  Fallback, List, ListItem, Row, SectionHeading, SectionMeta,
} from './ProfileList';

const ProfileAutoScrobbles = ({ autoScrobbles }: { autoScrobbles: AutoScrobble[] }) => {
  // Entries disappear at once; the page data follows once the action is done.
  const [items, hide] = useOptimistic(autoScrobbles, (current, id: number) => current.filter((item) => item.id !== id));
  const [, startTransition] = useTransition();
  const remove = (id: number) => startTransition(async () => {
    hide(id);
    await removeAutoScrobble(id);
  });

  return (
    <section aria-labelledby="auto-scrobbles">
      <SectionHeading id="auto-scrobbles">Auto-scrobbles</SectionHeading>
      <SectionMeta>These items are automatically scrobbled the next time they are scanned</SectionMeta>
      <List>
        {!items.length && (
          <Fallback>
            No entries found. Activate the option &quot;Auto-scrobble&quot; during your next scan.
          </Fallback>
        )}
        {items.map(({
          id, artist, title, year, image, scope,
        }) => (
          <ListItem key={id}>
            <Row image={image} title={title} details={[artist, year, scope].filter(Boolean).join(' · ')} />
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
    </section>
  );
};

export default ProfileAutoScrobbles;
