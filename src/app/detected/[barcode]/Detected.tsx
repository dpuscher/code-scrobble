'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import CircleLayout, { FooterContent } from '../../../components/layout/CircleLayout';
import ErrorMessage from '../../../components/layout/ErrorMessage';
import ReleaseActions from '../../../components/release/ReleaseActions';
import ReleaseInfo from '../../../components/release/ReleaseInfo';
import Scrobble, { type Ignored } from '../../../components/scrobble/Scrobble';
import Checkbox from '../../../components/ui/Checkbox';
import {
  defaultSelection, describeSelection, inSentence, preferredSelection, toSelection,
} from '../../../lib/parts';
import { scrobbledUrl } from '../../../lib/scrobbledUrl';
import { useSession } from '../../../lib/session';
import type { Release } from '../../../lib/types';

type Props = {
  /** The scanned barcode, or `id:<discogs id>`. */
  barcode: string;
  release: Release | null;
};

/** The release for a scanned barcode: pick the sides, then scrobble. */
const Detected = ({ barcode, release }: Props) => {
  const router = useRouter();
  const session = useSession();
  const [autoScrobble, setAutoScrobble] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  // The picked sides or discs; null until one is toggled, until then as much
  // of the record as last time is preselected (the first side, ...).
  const [picked, setPicked] = useState<string[] | null>(null);
  // Releases marked for auto-scrobbling skip the confirmation.
  const instant = !confirmed && Boolean(release?.instantScrobble);
  const scrobbling = confirmed || instant;

  const parts = release?.parts ?? [];
  const selection = instant
    ? release!.instantParts
    : toSelection(parts, picked ?? preferredSelection(parts, session?.partsPreference) ?? defaultSelection(parts));
  const scope = describeSelection(parts, selection);

  const rescan = () => router.push('/');
  // Replaces this page in the history: going back to it would scrobble an
  // auto-scrobble release again.
  const onScrobbled = useCallback((ignored?: Ignored) => {
    router.replace(scrobbledUrl(barcode, selection, ignored));
  }, [router, barcode, selection]);

  if (!release) {
    return (
      <CircleLayout>
        <ErrorMessage title={<>No release found<br />{barcode}</>} onRetry={rescan} />
      </CircleLayout>
    );
  }

  return (
    <CircleLayout
      header={!scrobbling && <ReleaseInfo release={release} />}
      footer={!scrobbling && (
        <FooterContent>
          <Checkbox name="autoScrobble" checked={autoScrobble} onChange={setAutoScrobble}>
            {scope ? `Auto-scrobble ${inSentence(scope)} on next scan` : 'Auto-scrobble on next scan'}
          </Checkbox>
        </FooterContent>
      )}
    >
      {scrobbling ? (
        <Scrobble release={release} parts={selection} autoScrobble={autoScrobble} remember={!instant} onScrobbled={onScrobbled} />
      ) : (
        <ReleaseActions
          release={release}
          selection={selection ?? defaultSelection(parts)}
          onSelect={setPicked}
          onScrobble={() => setConfirmed(true)}
          onCancel={rescan}
        />
      )}
    </CircleLayout>
  );
};

export default Detected;
