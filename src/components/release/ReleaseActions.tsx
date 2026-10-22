import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import type { Release } from '../../lib/types';

type Props = {
  release: Release;
  onScrobble: () => void;
  onCancel: () => void;
};

const buttonClass = 'flex grow flex-col items-center py-[12%] [&_svg]:mb-2.5';

/** Cover art with the "Cancel" and "Scrobble" actions. */
const ReleaseActions = ({ release, onScrobble, onCancel }: Props) => (
  <div
    className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-end bg-cover"
    style={release.image ? { backgroundImage: `url("${release.image}")` } : undefined}
  >
    <div className="flex w-full bg-black/50 px-[20%] text-center backdrop-blur-[10px]">
      <button type="button" onClick={onCancel} className={buttonClass}>
        <MdClose size="40px" aria-hidden />
        Cancel
      </button>
      <button type="button" onClick={onScrobble} className={buttonClass}>
        <FaLastfm size="40px" aria-hidden />
        Scrobble
      </button>
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
