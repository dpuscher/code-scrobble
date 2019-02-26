import React from 'react';
import PropTypes from 'prop-types';
import Router from 'next/router';
import { Subscribe } from 'unstated';
import ReleaseState from '../app/states/ReleaseState';
import ReleaseInfo from '../components/ReleaseInfo';
import Scrobble from '../components/Scrobble';
import SearchRelease from '../components/SearchRelease';
import CircleLayout from '../components/layout/CircleLayout';
import { FooterContent } from '../styles/layout.styles';
import Checkbox from '../components/Checkbox';

class Detected extends React.Component {
  state = {
    autoScrobble: false,
    scrobbling: false,
  }

  reScan = () => {
    Router.push('/scan');
  };

  scrobble = (id) => {
    this.setState({ scrobbling: true });
  };

  scrobbled = () => {
    const { barcode } = this.props;
    Router.push(`/scrobbled?barcode=${barcode}`, `/scrobbled/${barcode}`);
  };

  handleAutoScrobble = (autoScrobble) => {
    this.setState({ autoScrobble });
  }

  render() {
    const { scrobbling, autoScrobble } = this.state;
    const { barcode } = this.props;
    return (
      <Subscribe to={[ReleaseState]}>
        {(releaseState) => {
          const release = releaseState.get(barcode);
          return (
            <CircleLayout
              footer={!scrobbling && (
                <FooterContent>
                  <Checkbox name="autoScrobble" checked={autoScrobble} onChange={this.handleAutoScrobble}>
                    Auto-scrobble on next scan
                  </Checkbox>
                </FooterContent>
              )}
              header={!scrobbling && release.id && <ReleaseInfo release={release} />}
            >
              {
              scrobbling
                ? (
                  <Scrobble
                    release={release}
                    autoScrobble={autoScrobble}
                    onScrobbled={this.scrobbled}
                  />
                )
                : (
                  <SearchRelease
                    code={barcode}
                    onScrobble={this.scrobble}
                    onCancel={this.reScan}
                    setRelease={releaseState.set}
                    release={releaseState.get(barcode)}
                  />
                )
            }
            </CircleLayout>
          );
        }}
      </Subscribe>
    );
  }
}

Detected.propTypes = {
  barcode: PropTypes.string.isRequired,
};

Detected.getInitialProps = ({ query: { barcode } }) => ({ barcode });

export default Detected;
