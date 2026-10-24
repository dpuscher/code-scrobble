import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import type { Release } from '../../lib/types';
import PartPicker from './PartPicker';

type Props = {
  release: Release;
  /** The parts to scrobble, when the release has several. */
  selection: string[];
  onSelect: (selection: string[]) => void;
  onScrobble: () => void;
  onCancel: () => void;
};

const buttonClass = 'flex grow flex-col items-center py-[12%] transition-[scale,opacity] duration-100 ease-out enabled:active:scale-95 enabled:hover:opacity-80 disabled:opacity-40 [&_svg]:mb-2.5';

/** Cover art with the sides or discs to scrobble, and the "Cancel" and "Scrobble" actions. */
const ReleaseActions = ({
  release, selection, onSelect, onScrobble, onCancel,
}: Props) => (
  <div
    className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-end bg-cover"
    style={release.image ? { backgroundImage: `url("${release.image}")` } : undefined}
  >
    <div className="w-full bg-black/50 text-center backdrop-blur-[10px]">
      {release.parts.length > 1 && <PartPicker parts={release.parts} selection={selection} onChange={onSelect} />}
      <div className="flex w-full px-[20%]">
        <button type="button" onClick={onCancel} className={buttonClass}>
          <MdClose size="40px" aria-hidden />
          Cancel
        </button>
        <button type="button" onClick={onScrobble} disabled={!selection.length && release.parts.length > 1} className={buttonClass}>
          <FaLastfm size="40px" aria-hidden />
          Scrobble
        </button>
      </div>
    </div>
    {!release.image && (
      <div>
        <b>{release.artist}</b>
        <div>{release.title}</div>
      </div>
    )}
  </div>
);

export default ReleaseActions;
