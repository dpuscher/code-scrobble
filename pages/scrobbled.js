import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import Router from 'next/router';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import { fetchReleaseIfNeeded, getReleaseState } from '../app/states/ReleaseState';
import CircleLayout from '../components/layout/CircleLayout';
import { RetryButton } from '../components/styles/Error.styles';
import { trackEvent } from '../lib/analytics';
import { yellow } from '../lib/colors';
import { FlexContent } from '../styles/layout.styles';
import { CoverBackground } from '../styles/scrobbled.styles';

class Scrobbled extends React.Component {
  componentDidMount() {
    this.props.fetchReleaseIfNeeded(this.props.barcode);
  }

  onRetry = () => {
    trackEvent('Scrobbled', 'Rescan');
    Router.push('/');
  }

  render() {
    const { release: { data: { image } } } = this.props;
    return (
      <CircleLayout>
        <FlexContent>
          {image && <CoverBackground image={image} />}
          <FaCheckCircle color={yellow} size="50px" />
          <div css="margin: 30px 30px 0">Record sucessfully scrobbled to Last.fm</div>
          <RetryButton onClick={this.onRetry}>
            <IoMdQrScanner size="30px" css="margin-bottom: 7px" />
            Scan another code
          </RetryButton>
        </FlexContent>
      </CircleLayout>
    );
  }
}

Scrobbled.getInitialProps = ({ query: { barcode } }) => ({ barcode });

Scrobbled.propTypes = {
  barcode: PropTypes.string.isRequired,
  release: PropTypes.object,
  fetchReleaseIfNeeded: PropTypes.func.isRequired,
};

Scrobbled.defaultProps = {
  release: {},
};

const mapStateToProps = (state, { barcode }) => {
  const release = getReleaseState(state, barcode);

  return { release };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchReleaseIfNeeded }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Scrobbled);
