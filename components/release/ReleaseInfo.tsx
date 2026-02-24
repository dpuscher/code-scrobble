import React from "react";
import { MdClose } from "react-icons/md"; // TODO: replace
import durationFormat from "../../lib/durationFormat";
import targetBlank from "../../lib/targetBlank";
import {
  Artist,
  Button,
  CloseButton,
  Content,
  Cover,
  ExternalButton,
  Head,
  HeadWrapper,
  Icon,
  Meta,
  Overlay,
  Title,
  TrackDuration,
  TrackListWrapper,
  TrackNumber,
  TrackTitle,
  Wrapper,
  Year,
} from "./styles/ReleaseInfo.styles";
import { silver } from "../../lib/colors";
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
      <Wrapper>
        <Button onClick={this.handleButton}>
          <Icon />
        </Button>
        {open && (
          <Overlay>
            <Content>
              <CloseButton onClick={this.handleButton}>
                <MdClose size="30" color={silver} />
              </CloseButton>
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
              <ExternalButton href={url} {...autotrackParams("Detected", "Exit to Discogs")} {...targetBlank}>
                Show on Discogs
              </ExternalButton>
            </Content>
          </Overlay>
        )}
      </Wrapper>
    );
  }
}

export default ReleaseInfo;
