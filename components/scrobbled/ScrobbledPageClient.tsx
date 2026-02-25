"use client";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import React from "react";
import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import { IoMdQrScanner } from "react-icons/io";
import { fetchReleaseIfNeeded } from "../release/actions/releaseActions";
import CircleLayout from "../layout/CircleLayout";
import { RetryButton } from "../layout/styles/Error.styles";
import { trackEvent } from "../../lib/analytics";
import { yellow } from "../../lib/colors";
import { FlexContent } from "../../styles/layout.styles";
import { CoverBackground } from "../../styles/scrobbled.styles";

interface ScrobbledPageClientProps {
  barcode: string;
  fetchReleaseIfNeeded: (barcode: string) => void;
  data?: any;
}

class ScrobbledPage extends React.Component<ScrobbledPageClientProps & { router: ReturnType<typeof useRouter> }, {}> {
  componentDidMount() {
    this.props.fetchReleaseIfNeeded(this.props.barcode);
  }

  onRetry = () => {
    trackEvent("Scrobbled", "Rescan");
    this.props.router.push("/");
  };

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

function withRouter(Component: typeof ScrobbledPage) {
  return function WithRouterWrapper(props: Omit<ScrobbledPageClientProps, "router">) {
    const router = useRouter();
    return <Component {...(props as ScrobbledPageClientProps)} router={router} />;
  };
}

const mapStateToProps = (state: any, { barcode }: { barcode: string }) => ({
  ...state.release[barcode],
});

const mapDispatchToProps = (dispatch: any) => bindActionCreators({ fetchReleaseIfNeeded }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ScrobbledPage) as any);
