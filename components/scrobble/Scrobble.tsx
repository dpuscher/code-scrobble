import React from "react";
import Spinner from "../layout/Spinner";
import ScrobbleError from "./ScrobbleError";

interface ScrobbleProps {
  release: { id: string; image?: string; [key: string]: any };
  autoScrobble: boolean;
  onScrobbled: () => void;
}

class Scrobble extends React.Component<ScrobbleProps, { loadingError: boolean }> {
  state = {
    loadingError: false,
  };

  componentDidMount() {
    this.doRequest();
  }

  doRequest = async () => {
    const {
      release: { id },
      autoScrobble,
      onScrobbled,
    } = this.props;

    try {
      this.setState({ loadingError: false });

      await fetch("/api/scrobble", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, autoScrobble }),
      });
    } catch {
      return this.setState({ loadingError: true });
    }
    return onScrobbled();
  };

  render() {
    const { loadingError } = this.state;
    const { release } = this.props;
    return loadingError ? (
      <ScrobbleError onRetry={this.doRequest} />
    ) : (
      <div
        className="flex absolute inset-0 items-center justify-center bg-cover"
        style={release.image ? { backgroundImage: `url("${release.image}")` } : undefined}
      >
        <Spinner className="w-full h-full" />
        <div className="absolute bottom-0 left-0 w-full py-[12%] px-[20%] bg-black/50 text-center backdrop-blur-[10px] text-shadow-dark">
          Sending data to Last.fm
        </div>
      </div>
    );
  }
}

export default Scrobble;
