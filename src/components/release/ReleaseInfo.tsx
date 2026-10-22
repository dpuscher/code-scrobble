import { useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import durationFormat from '../../lib/durationFormat';
import targetBlank from '../../lib/targetBlank';
import type { Release } from '../../lib/types';
import Overlay from '../ui/Overlay';
import { ToggleButton, ToggleWrapper } from '../ui/styles/Overlay.styles';
import {
  Artist, Cover, ExternalButton, Head, HeadWrapper, Meta, Title, TrackDuration, TrackListWrapper,
  TrackNumber, TrackTitle, Year,
} from './styles/ReleaseInfo.styles';

/** Info button that opens the tracklist of the detected release. */
const ReleaseInfo = ({ release }: { release: Release }) => {
  const [open, setOpen] = useState(false);
  const {
    image, title, year, artist, tracks, url,
  } = release;

  return (
    <ToggleWrapper>
      <ToggleButton type="button" onClick={() => setOpen(true)} aria-label="Release info">
        <IoIosInformationCircleOutline aria-hidden />
      </ToggleButton>
      {open && (
        <Overlay label={`${artist} - ${title}`} onClose={() => setOpen(false)}>
          <HeadWrapper>
            <Head>
              {image && <Cover src={image} alt="" />}
              <Meta>
                <Title>{title}</Title>
                <Artist>{artist}</Artist>
                <Year>{year}</Year>
              </Meta>
            </Head>
          </HeadWrapper>
          <TrackListWrapper>
            <table>
              <tbody>
                {tracks.map(({ trackNumber, title: trackTitle, duration }) => (
                  <tr key={trackNumber}>
                    <TrackNumber>{trackNumber}</TrackNumber>
                    <TrackTitle>{trackTitle}</TrackTitle>
                    <TrackDuration>{durationFormat(duration)}</TrackDuration>
                  </tr>
                ))}
              </tbody>
            </table>
          </TrackListWrapper>
          {url && (
            <ExternalButton href={url} {...targetBlank}>
              Show on Discogs
            </ExternalButton>
          )}
        </Overlay>
      )}
    </ToggleWrapper>
  );
};

export default ReleaseInfo;
