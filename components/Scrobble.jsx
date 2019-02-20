import PropTypes from 'prop-types';
import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner, IoIosRefresh } from 'react-icons/io';
import { yellow } from '../lib/colors';
import { Error, ErrorIcon, RetryButton } from './styles/Error.styles';
import { Loading, LoadingContent, LoadingWrapper } from './styles/Scrobble.styles';

class Scrobble extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadingError: false,
    };
    this.doRequest = this.doRequest.bind(this);
  }

  componentDidMount() {
    this.doRequest();
  }

  async doRequest() {
    try {
      this.setState({ loading: true, loadingError: false });
      const { data: { id }, autoScrobble } = this.props;

      const response = await fetch('/scrobble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, autoScrobble }),
      });
      await response.json();
    } catch (error) {
      this.setState({ loadingError: true });
    }
    this.setState({ loading: false });
  }

  render() {
    const { loading, loadingError } = this.state;
    const { data, onRetry } = this.props;
    return (
      <>
        {loading && (
          <LoadingWrapper image={data.image}>
            <Loading />
            <LoadingContent>Sending data to Last.fm</LoadingContent>
          </LoadingWrapper>
        )}
        {!loading && loadingError && (
        <Error>
          <ErrorIcon color={yellow} />
          <b>An error occured while sending data to Last.fm</b>
          <RetryButton onClick={this.doRequest}>
            <IoIosRefresh size="30px" css="margin-bottom: 7px" />
            Retry
          </RetryButton>
        </Error>
        )}
        {!loading && !loadingError && (
          <Error>
            <FaCheckCircle color={yellow} size="50px" />
            <div css="margin: 30px 30px 0">Record sucessfully scrobbled to Last.fm</div>
            <RetryButton onClick={onRetry}>
              <IoMdQrScanner size="30px" css="margin-bottom: 7px" />
              Scan another code
            </RetryButton>
          </Error>
        )}
      </>
    );
  }
}

Scrobble.propTypes = {
  data: PropTypes.object.isRequired,
  onRetry: PropTypes.func.isRequired,
  autoScrobble: PropTypes.bool.isRequired,
};

export default Scrobble;
