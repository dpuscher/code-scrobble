import PropTypes from 'prop-types';
import React from 'react';
import { yellow } from '../../lib/colors';
import { FlexContent } from '../../styles/layout.styles';
import { ErrorDescription, ErrorIcon } from '../layout/styles/Error.styles';
import { Camera } from './styles/Scanner.styles';
import Loading from '../layout/Loading';

class Scanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      videoError: false,
    };
  }

  async componentDidMount() {
    // StrictMode remounts the same instance; ignore callbacks of stale mounts.
    this.mountId = (this.mountId || 0) + 1;
    const { mountId } = this;
    const isStale = () => this.mountId !== mountId;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setState({ videoError: true, loading: false });
      return;
    }
    // Loaded on demand: the decoder is only needed on the scan page.
    const { default: Quagga } = await import('@ericblade/quagga2');
    if (isStale()) return;
    this.Quagga = Quagga;

    Quagga.init({
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: document.querySelector('#camera'),
        constraints: {
          width: { min: 1280 },
          height: { min: 720 },
          facingMode: 'environment',
          frameRate: 15,
          aspectRatio: { min: 1, max: 2 },
        },
      },
      locator: {
        patchSize: 'large',
        halfSample: true,
      },
      locate: true,
      frequency: 10,
      decoder: {
        readers: ['ean_8_reader', 'ean_reader'],
      },
    }, (err) => {
      if (isStale()) {
        if (!err) Quagga.stop();
        return;
      }
      if (err) {
        this.setState({ videoError: true, loading: false });
        return;
      }
      Quagga.onDetected(this.onDetected);
      Quagga.start();
      this.setState({ loading: false });
    });
  }

  componentWillUnmount() {
    this.mountId += 1;
    if (this.Quagga) {
      this.Quagga.offDetected(this.onDetected);
      this.Quagga.stop();
    }
  }

  onDetected = (result) => {
    const { onDetected } = this.props;
    this.setState({ loading: true });

    this.Quagga.offDetected(this.onDetected);
    onDetected(result);
  }

  render() {
    const { videoError, loading } = this.state;
    const ready = !loading && !videoError;
    return (
      <>
        {loading && <Loading /> }
        {videoError && (
          <FlexContent>
            <ErrorIcon color={yellow} />
            <b>An error occurred</b>
            <ErrorDescription>
              Please make sure this website is allowed to use the camera.
            </ErrorDescription>
          </FlexContent>
        )}
        { }
        <Camera id="camera" visible={ready}><video playsInline autoPlay /></Camera>
      </>
    );
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired,
};

export default Scanner;
