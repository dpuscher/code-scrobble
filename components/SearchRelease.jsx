import PropTypes from 'prop-types';
import React from 'react';
import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import Loading from './Loading';
import SearchReleaseError from './SearchReleaseError';
import {
  Button, Poster, PosterContent, PosterFallback,
} from './styles/SearchRelease.styles';

class SearchRelease extends React.Component {
  state = {
    loading: true,
    loadingError: false,
  }

  componentDidMount() {
    this.doRequest();
  }

  doRequest = async () => {
    const {
      release, code, setRelease, onScrobble,
    } = this.props;

    console.log(release);
    if (!release.id) {
      const response = await fetch(`/search/${code}`);
      const json = await response.json();
      if (!json.id) {
        this.setState({ loadingError: true });
      } else {
        setRelease(code, json);
        if (json.instantScrobble) {
          onScrobble();
        }
      }
    }
    this.setState({ loading: false });
  };

  render() {
    const {
      code, onCancel, release, onScrobble,
    } = this.props;
    const { loading, loadingError } = this.state;
    return (
      <>
        {loading && <Loading />}
        {!loading && loadingError && (
          <SearchReleaseError code={code} onRetry={onCancel} />
        )}
        {!loading && !loadingError && (
          <Poster image={release.image}>
            <PosterContent>
              <Button onClick={onCancel}>
                <MdClose size="40px" css="margin-bottom: 10px" />
                Cancel
              </Button>
              <Button onClick={onScrobble}>
                <FaLastfm size="40px" css="margin-bottom: 10px" />
                Scrobble
              </Button>
            </PosterContent>
            {!release.image && (
              <PosterFallback>
                <b>{release.artist}</b>
                <div>{release.title}</div>
              </PosterFallback>
            )}
          </Poster>
        )}
      </>
    );
  }
}

SearchRelease.propTypes = {
  code: PropTypes.string.isRequired,
  onScrobble: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  setRelease: PropTypes.func.isRequired,
  release: PropTypes.object.isRequired,
};

export default SearchRelease;
