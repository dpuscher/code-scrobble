import PropTypes from 'prop-types';
import React from 'react';
import Router from 'next/router';
import { FaCheckCircle } from 'react-icons/fa';
import { IoMdQrScanner } from 'react-icons/io';
import { Subscribe } from 'unstated';
import ReleaseState from '../app/states/ReleaseState';
import CircleLayout from '../components/layout/CircleLayout';
import { RetryButton } from '../components/styles/Error.styles';
import { yellow } from '../lib/colors';
import { FlexContent } from '../styles/layout.styles';
import { CoverBackground } from '../styles/scrobbled.styles';

class Scrobbled extends React.Component {
  onRetry = () => {
    Router.push('/');
  }

  render() {
    const { barcode } = this.props;
    return (
      <CircleLayout>
        <FlexContent>
          <Subscribe to={[ReleaseState]}>
            {(releaseState) => {
              const { image } = releaseState.get(barcode);
              return (
                <>
                  {image && <CoverBackground image={image} />}
                  <FaCheckCircle color={yellow} size="50px" />
                  <div css="margin: 30px 30px 0">Record sucessfully scrobbled to Last.fm</div>
                  <RetryButton onClick={this.onRetry}>
                    <IoMdQrScanner size="30px" css="margin-bottom: 7px" />
                    Scan another code
                  </RetryButton>
                </>
              );
            }}
          </Subscribe>
        </FlexContent>
      </CircleLayout>
    );
  }
}

Scrobbled.getInitialProps = ({ query: { barcode } }) => ({ barcode });

Scrobbled.propTypes = {
  barcode: PropTypes.string,
};

Scrobbled.defaultProps = {
  barcode: null,
};

export default Scrobbled;
