import { connect } from "react-redux";
import React from "react";
import Router from "next/router";
import Head from "next/head";
import ReleaseInfo from "../../components/release/ReleaseInfo";
import Scrobble from "../../components/scrobble/Scrobble";
import SearchRelease from "../../components/release/SearchRelease";
import CircleLayout from "../../components/layout/CircleLayout";
import { trackEvent } from "../../lib/analytics";
import { FooterContent } from "../../styles/layout.styles";
import Checkbox from "../../components/ui/Checkbox";

interface DetectedProps {
  barcode: string;
  data?: any;
}

class Detected extends React.Component<DetectedProps, { autoScrobble: boolean; scrobbling: boolean }> {
  state = {
    autoScrobble: false,
    scrobbling: false,
  };

  reScan = () => {
    Router.push("/");
  };

  scrobble = () => {
    this.setState({ scrobbling: true });
  };

  scrobbled = () => {
    const { barcode } = this.props;
    Router.push(`/scrobbled/${barcode}`);
  };

  handleAutoScrobble = autoScrobble => {
    if (autoScrobble) trackEvent("Detected", "AutoScrobble");
    this.setState({ autoScrobble });
  };

  render() {
    const { scrobbling, autoScrobble } = this.state;
    const { barcode, data = null } = this.props;
    const showRelease = !scrobbling && data && data.id;
    return (
      <>
        <Head>
          <link rel="preconnect" href="https://img.discogs.com" />
        </Head>
        <CircleLayout
          footer={
            showRelease && (
              <FooterContent>
                <Checkbox name="autoScrobble" checked={autoScrobble} onChange={this.handleAutoScrobble}>
                  Auto-scrobble on next scan
                </Checkbox>
              </FooterContent>
            )
          }
          header={showRelease && <ReleaseInfo release={data} />}
        >
          {scrobbling ? (
            <Scrobble release={data} autoScrobble={autoScrobble} onScrobbled={this.scrobbled} />
          ) : (
            <SearchRelease code={barcode} onScrobble={this.scrobble} onCancel={this.reScan} />
          )}
        </CircleLayout>
      </>
    );
  }
}

(Detected as any).getInitialProps = ({ query: { barcode } }) => ({ barcode });

const mapStateToProps = (state, { barcode }) => ({
  ...state.release[barcode],
});

export default connect(mapStateToProps)(Detected);
