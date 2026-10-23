import { useState } from 'react';
import { IoIosSearch } from 'react-icons/io';
import { saveSearchFormat } from '../../lib/api';
import type { SearchFormat } from '../../lib/formats';
import { useSession } from '../../lib/session';
import Overlay, { OverlayToggle } from '../ui/Overlay';
import ReleaseSearch from './ReleaseSearch';

type Props = {
  /** Lets the scan page pause the scanner while the search is open. */
  onOpenChange?: (open: boolean) => void;
};

/** Search button that opens a Discogs release search, for unreadable barcodes. */
const QueryRelease = ({ onOpenChange }: Props) => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  // Kept across openings and saved to the user, so it applies on every device.
  const [format, setFormat] = useState<SearchFormat | null>(session?.searchFormat ?? null);

  const show = () => {
    setOpen(true);
    onOpenChange?.(true);
  };

  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  const changeFormat = (next: SearchFormat | null) => {
    setFormat(next);
    // Only a preference: the search works the same if saving fails.
    saveSearchFormat(next).catch(() => {});
  };

  return (
    <OverlayToggle label="Search release" icon={<IoIosSearch aria-hidden />} onClick={show}>
      {open && (
        <Overlay label="Search release" onClose={close} fullHeight>
          <ReleaseSearch format={format} onFormatChange={changeFormat} />
        </Overlay>
      )}
    </OverlayToggle>
  );
};

export default QueryRelease;
