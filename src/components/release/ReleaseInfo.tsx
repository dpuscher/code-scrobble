import { useState } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import durationFormat from '../../lib/durationFormat';
import targetBlank from '../../lib/targetBlank';
import type { Release } from '../../lib/types';
import Overlay, { OverlayToggle } from '../ui/Overlay';

/** Info button that opens the tracklist of the detected release. */
const ReleaseInfo = ({ release }: { release: Release }) => {
  const [open, setOpen] = useState(false);
  const {
    image, title, year, artist, tracks, url,
  } = release;

  return (
    <OverlayToggle label="Release info" icon={<IoIosInformationCircleOutline aria-hidden />} onClick={() => setOpen(true)}>
      {open && (
        <Overlay label={`${artist} - ${title}`} onClose={() => setOpen(false)}>
          <div className="-mx-5 -mt-5 flex-[0_0] overflow-hidden border-b border-dark">
            <div className="relative -m-[5px] overflow-hidden">
              {image && <img src={image} alt="" className="absolute h-full w-full object-cover opacity-40 blur-[10px]" />}
              <div className="relative z-1 flex-1 p-5 text-[25px]">
                <div className="mb-2 text-[1em] font-bold">{title}</div>
                <div className="mb-2 text-[.8em]">{artist}</div>
                <div className="text-[.5em]">{year}</div>
              </div>
            </div>
          </div>
          <div className="overflow-auto pt-2.5">
            <table className="border-separate border-spacing-0.5">
              <tbody>
                {tracks.map(({ trackNumber, title: trackTitle, duration }) => (
                  <tr key={trackNumber}>
                    <td className="w-0 p-px whitespace-nowrap">{trackNumber}</td>
                    <td className="w-full p-px">{trackTitle}</td>
                    <td className="w-0 p-px whitespace-nowrap">{durationFormat(duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {url && (
            <a href={url} {...targetBlank} className="mt-2.5 w-full border-2 border-dark p-[7px] text-center">
              Show on Discogs
            </a>
          )}
        </Overlay>
      )}
    </OverlayToggle>
  );
};

export default ReleaseInfo;
