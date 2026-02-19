import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { fetchRelease } from './actions/releaseActions';
import Loading from '../layout/Loading';
import SearchReleaseError from './SearchReleaseError';
import { Button, Poster, PosterContent } from './styles/SearchRelease.styles';
import { autotrackParams } from '../../lib/analytics';

interface SearchReleaseProps {
  code: string;
  onScrobble: () => void;
  onCancel: () => void;
  fetchRelease: (code: string) => void;
  error?: any;
  loading?: boolean;
  data?: any;
}

class SearchRelease extends React.Component<SearchReleaseProps, {}> {
  componentDidMount() {
    this.props.fetchRelease(this.props.code);
  }

  componentDidUpdate(prevProps: SearchReleaseProps) {
    const { data } = this.props;
    if (prevProps.data !== data && data.instantScrobble) {
      this.props.onScrobble();
    }
  }

  render() {
    const {
      code, error = null, loading = true, data = {}, onCancel, onScrobble,
    } = this.props;
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

const mapStateToProps = (state, { code }) => ({
  ...state.release[code],
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchRelease }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchRelease) as any;
