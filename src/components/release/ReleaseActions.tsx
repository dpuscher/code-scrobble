import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import type { Release } from '../../lib/types';
import { Button, Poster, PosterContent } from './styles/ReleaseActions.styles';

type Props = {
  release: Release;
  onScrobble: () => void;
  onCancel: () => void;
};

/** Cover art with the "Cancel" and "Scrobble" actions. */
const ReleaseActions = ({ release, onScrobble, onCancel }: Props) => (
  <Poster $image={release.image}>
    <PosterContent>
      <Button type="button" onClick={onCancel}>
        <MdClose size="40px" aria-hidden />
        Cancel
      </Button>
      <Button type="button" onClick={onScrobble}>
        <FaLastfm size="40px" aria-hidden />
        Scrobble
      </Button>
    </PosterContent>
    {!release.image && (
      <div>
        <b>{release.artist}</b>
        <div>{release.title}</div>
      </div>
    )}
  </Poster>
);

export default ReleaseActions;
