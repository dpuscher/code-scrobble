import PropTypes from 'prop-types';
import React from 'react';
import { Loading, LoadingContent, LoadingWrapper } from './styles/Scrobble.styles';
import ScrobbleError from './ScrobbleError';

class Scrobble extends React.Component {
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

Scrobble.propTypes = {
  release: PropTypes.object.isRequired,
  autoScrobble: PropTypes.bool.isRequired,
  onScrobbled: PropTypes.func.isRequired,
};

export default Scrobble;
