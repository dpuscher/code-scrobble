import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { fetchRelease, getReleaseState } from '../app/states/ReleaseState';
import Loading from './Loading';
import SearchReleaseError from './SearchReleaseError';
import { Button, Poster, PosterContent } from './styles/SearchRelease.styles';
import { autotrackParams } from '../lib/analytics';

class SearchRelease extends React.Component {
  componentDidMount() {
    this.props.fetchRelease(this.props.code);
  }

  componentDidUpdate(prevProps) {
    const { release } = this.props;
    if (prevProps.release !== release && release.data && release.data.instantScrobble) {
      this.props.onScrobble();
    }
  }

  render() {
    const {
      code, onCancel, release, onScrobble,
    } = this.props;
    const { error, loading, data } = release;
    return (
      <>
        {loading && <Loading />}
        {!loading && error && (
          <SearchReleaseError code={code} onRetry={onCancel} {...autotrackParams('Search', 'Retry')} />
        )}
        {!loading && !error && (
          <Poster image={data.image}>
            <PosterContent>
              <Button onClick={onCancel} {...autotrackParams('Detected', 'Cancel')}>
                <MdClose size="40px" css="margin-bottom: 10px" />
                Cancel
              </Button>
              <Button onClick={onScrobble} {...autotrackParams('Detected', 'Scrobble')}>
                <FaLastfm size="40px" css="margin-bottom: 10px" />
                Scrobble
              </Button>
            </PosterContent>
            {!data.image && (
              <div>
                <b>{data.artist}</b>
                <div>{data.title}</div>
              </div>
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
  fetchRelease: PropTypes.func.isRequired,
  release: PropTypes.object,
};

SearchRelease.defaultProps = {
  release: {},
};

const mapStateToProps = (state, { code }) => {
  const release = getReleaseState(state, code);

  return {
    release,
  };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchRelease }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchRelease);
