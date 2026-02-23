import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import Router from 'next/router';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import { fetchReleaseIfNeeded } from '../../components/release/actions/releaseActions';
import CircleLayout from '../../components/layout/CircleLayout';
import { RetryButton } from '../../components/layout/styles/Error.styles';
import { trackEvent } from '../../lib/analytics';
import { yellow } from '../../lib/colors';
import { FlexContent } from '../../styles/layout.styles';
import { CoverBackground } from '../../styles/scrobbled.styles';

interface ScrobbledProps {
  barcode: string;
  fetchReleaseIfNeeded: (barcode: string) => void;
  data?: any;
}

class Scrobbled extends React.Component<ScrobbledProps, {}> {
  componentDidMount() {
    this.props.fetchReleaseIfNeeded(this.props.barcode);
  }

  onRetry = () => {
    trackEvent('Scrobbled', 'Rescan');
    Router.push('/');
  }

  render() {
    const { data = {} } = this.props;
    const { image } = data;
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

(Scrobbled as any).getInitialProps = ({ query: { barcode } }) => ({ barcode });

const mapStateToProps = (state, { barcode }) => ({
  ...state.release[barcode],
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchReleaseIfNeeded }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Scrobbled);
