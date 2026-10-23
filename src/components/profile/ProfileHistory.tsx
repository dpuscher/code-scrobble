'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import TimeAgo from 'react-timeago';
import type { HistoryItem } from '../../lib/types';
import {
  Fallback, List, ListItem, Row, SectionHeading, SectionMeta,
} from './ProfileList';

// Rendered on the server too, and a second may pass before the page
// hydrates; the text updates itself anyway.
const RelativeTime = (props: ComponentProps<'time'>) => <time {...props} suppressHydrationWarning />;

const ProfileHistory = ({ history }: { history: HistoryItem[] }) => (
  <section aria-labelledby="history">
    <SectionHeading id="history">History</SectionHeading>
    <SectionMeta>Your recently scanned items. Tap one to scrobble it again.</SectionMeta>
    <List>
      {!history.length && <Fallback>No entries found.</Fallback>}
      {history.map(({
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
                  <TimeAgo date={time} component={RelativeTime} />
                </>
              )}
            />
          </Link>
        </ListItem>
      ))}
    </List>
  </section>
);

export default ProfileHistory;
