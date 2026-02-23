import React from 'react';
import { Loading, LoadingContent, LoadingWrapper } from './styles/Scrobble.styles';
import ScrobbleError from './ScrobbleError';

interface ScrobbleProps {
  release: { id: string; image?: string; [key: string]: any };
  autoScrobble: boolean;
  onScrobbled: () => void;
}

class Scrobble extends React.Component<ScrobbleProps, { loadingError: boolean }> {
  state = {
    loadingError: false,
  };

  componentDidMount() {
    this.doRequest();
  }

  doRequest = async () => {
    const { release: { id }, autoScrobble, onScrobbled } = this.props;

    try {
      this.setState({ loadingError: false });

      await fetch('/api/scrobble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, autoScrobble }),
      });
    } catch (error) {
      return this.setState({ loadingError: true });
    }
    return onScrobbled();
  }

  render() {
    const { loadingError } = this.state;
    const { release } = this.props;
    return (
      loadingError
        ? <ScrobbleError onRetry={this.doRequest} />
        : (
          <LoadingWrapper image={release.image}>
            <Loading />
            <LoadingContent>Sending data to Last.fm</LoadingContent>
          </LoadingWrapper>
        )
    );
  }
}

export default Scrobble;
