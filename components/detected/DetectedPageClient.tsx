"use client";

import { connect } from "react-redux";
import React from "react";
import { useRouter } from "next/navigation";
import ReleaseInfo from "../release/ReleaseInfo";
import Scrobble from "../scrobble/Scrobble";
import SearchRelease from "../release/SearchRelease";
import CircleLayout from "../layout/CircleLayout";
import { trackEvent } from "../../lib/analytics";
import { FooterContent } from "../../styles/layout.styles";
import Checkbox from "../ui/Checkbox";

interface DetectedPageClientProps {
  barcode: string;
  data?: any;
}

class DetectedPage extends React.Component<
  DetectedPageClientProps & { router: ReturnType<typeof useRouter> },
  { autoScrobble: boolean; scrobbling: boolean }
> {
  state = {
    autoScrobble: false,
    scrobbling: false,
  };

  reScan = () => {
    this.props.router.push("/");
  };

  scrobble = () => {
    this.setState({ scrobbling: true });
  };

  scrobbled = () => {
    const { barcode } = this.props;
    this.props.router.push(`/scrobbled/${barcode}`);
  };

  handleAutoScrobble = (autoScrobble: boolean) => {
    if (autoScrobble) trackEvent("Detected", "AutoScrobble");
    this.setState({ autoScrobble });
  };

  render() {
    const { scrobbling, autoScrobble } = this.state;
    const { barcode, data = null } = this.props;
    const showRelease = !scrobbling && data && data.id;
    return (
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
    );
  }
}

function withRouter(Component: typeof DetectedPage) {
  return function WithRouterWrapper(props: DetectedPageClientProps) {
    const router = useRouter();
    return <Component {...props} router={router} />;
  };
}

const mapStateToProps = (state: any, { barcode }: { barcode: string }) => ({
  ...state.release[barcode],
});

export default connect(mapStateToProps)(withRouter(DetectedPage));
