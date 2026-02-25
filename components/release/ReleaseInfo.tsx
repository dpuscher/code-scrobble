import React from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { MdClose } from "react-icons/md";
import durationFormat from "../../lib/durationFormat";
import targetBlank from "../../lib/targetBlank";
import { autotrackParams, trackEvent } from "../../lib/analytics";

type Track = {
  trackNumber: string;
  title: string;
  duration: number;
};

type Release = {
  image?: string;
  title: string;
  year?: string;
  artist: string;
  tracks: Track[];
  url: string;
};

interface ReleaseInfoProps {
  release?: Release;
}

class ReleaseInfo extends React.Component<ReleaseInfoProps, { open: boolean }> {
  state = {
    open: false,
  };

  handleButton = () => {
    const { open } = this.state;
    if (!open) trackEvent("Detected", "Show Release Info");
    this.setState(state => ({ open: !state.open }));
  };

  render() {
    const { open } = this.state;
    const { release: { image, title, year, artist, tracks, url } = {} as Release } = this.props;
    return (
      <div className="relative w-[500px] max-w-[80%] h-full mx-auto">
        <button
          onClick={this.handleButton}
          className="absolute z-10 bottom-0 left-0 w-[15%] p-[2.5%] appearance-none translate-y-full border-0 bg-transparent text-inherit cursor-pointer"
        >
          <IoIosInformationCircleOutline className="w-full h-auto" />
        </button>
        {open && (
          <div className="fixed inset-0 z-10 flex items-center justify-center overflow-auto bg-black/70 backdrop-blur-[10px] [-webkit-overflow-scrolling:touch]">
            <div className="relative flex flex-col w-full max-w-[600px] max-h-[calc(100%-60px)] m-[40px_20px_20px] p-5 rounded-[3px] bg-white text-dark">
              <button
                onClick={this.handleButton}
                className="absolute top-[-40px] right-0 py-[5px] appearance-none border-0 bg-transparent text-inherit cursor-pointer"
              >
                <MdClose size="30" color="#d4d4dc" />
              </button>
              <div className="flex-none -mx-5 -mt-5 overflow-hidden border-b border-dark">
                <div className="relative -m-[5px] overflow-hidden">
                  {image && (
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover blur-[10px] opacity-40"
                    />
                  )}
                  <div className="relative z-10 flex-1 p-5 text-[25px]">
                    <div className="mb-2 text-[1em] font-bold">{title}</div>
                    <div className="mb-2 text-[0.8em]">{artist}</div>
                    <div className="text-[0.5em]">{year}</div>
                  </div>
                </div>
              </div>
              <div className="pt-[10px] overflow-auto [-webkit-overflow-scrolling:touch]">
                <table>
                  <tbody>
                    {tracks.map(({ trackNumber, title: trackTitle, duration }) => (
                      <tr key={trackNumber}>
                        <td className="w-0 whitespace-nowrap">{trackNumber}</td>
                        <td className="w-full">{trackTitle}</td>
                        <td className="w-0 whitespace-nowrap">{durationFormat(duration)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <a
                href={url}
                className="block w-full mt-[10px] p-[7px] border-2 border-dark text-inherit text-center no-underline cursor-pointer"
                {...autotrackParams("Detected", "Exit to Discogs")}
                {...targetBlank}
              >
                Show on Discogs
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ReleaseInfo;
