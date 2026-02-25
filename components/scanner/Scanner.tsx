import React from "react";
import Quagga from "quagga";
import ErrorIcon from "../icons/ErrorIcon";
import Loading from "../layout/Loading";

interface ScannerProps {
  onDetected: (result: any) => void;
}

class Scanner extends React.Component<ScannerProps, { loading: boolean; videoError: boolean }> {
  constructor(props: ScannerProps) {
    super(props);
    this.state = {
      loading: true,
      videoError: false,
    };
  }

  componentDidMount() {
    if (navigator.mediaDevices && "getUserMedia" in navigator.mediaDevices) {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector("#camera"),
            constraints: {
              width: { min: 1280 },
              height: { min: 720 },
              facingMode: "environment",
              frameRate: 15,
              aspectRatio: { min: 1, max: 2 },
            },
          },
          locator: {
            patchSize: "large",
            halfSample: true,
          },
          numOfWorkers: 2,
          locate: true,
          frequency: 10,
          decoder: {
            readers: ["ean_8_reader", "ean_reader"],
          },
        },
        err => {
          if (err) {
            this.setState({ videoError: true, loading: false });
            return;
          }
          this.onInitSuccess();
        },
      );
      Quagga.onDetected(this.onDetected);
    }
  }

  componentWillUnmount() {
    Quagga.stop();
  }

  onInitSuccess = () => {
    Quagga.start();
    this.setState({ loading: false });
  };

  onDetected = (result: { codeResult: { code: string } }) => {
    const { onDetected } = this.props;
    this.setState({ loading: true });

    Quagga.offDetected(this.onDetected);
    onDetected(result);
  };

  render() {
    const { videoError, loading } = this.state;
    const ready = !loading && !videoError;
    return (
      <>
        {loading && <Loading />}
        {videoError && (
          <div className="absolute flex flex-col items-center justify-center w-full h-full p-[10%] text-center">
            <ErrorIcon color="#feda6a" className="w-[30%] h-auto mb-[15px]" />
            <b>An error occurred</b>
            <div className="mt-[10px]">Please make sure this website is allowed to use the camera.</div>
          </div>
        )}
        <div
          id="camera"
          className={`${ready ? "visible" : "invisible"} absolute inset-0 [transform:translate3d(0,0,0)] [&_video]:absolute [&_video]:inset-0 [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_canvas]:absolute [&_canvas]:inset-0 [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-cover`}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video playsInline autoPlay />
        </div>
      </>
    );
  }
}

export default Scanner;
