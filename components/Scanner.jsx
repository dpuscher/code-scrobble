import PropTypes from 'prop-types';
import React from 'react';
import Quagga from 'quagga';
import { yellow } from '../lib/colors';
import { FlexContent } from '../styles/layout.styles';
import { ErrorDescription, ErrorIcon } from './styles/Error.styles';
import { Camera } from './styles/Scanner.styles';
import Loading from './Loading';

class Scanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      videoError: false,
    };
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
        numOfWorkers: 2,
        locate: true,
        frequency: 10,
        decoder: {
          readers: ['ean_8_reader', 'ean_reader'],
        },
      }, (err) => {
        if (err) {
          this.setState({ videoError: true });
          return;
        }
        this.onInitSuccess();
      });
      Quagga.onDetected(this.onDetected);
    }
  }

  componentWillUnmount() {
    Quagga.stop();
  }

  onInitSuccess = () => {
    Quagga.start();
    this.setState({ loading: false });
  }

  onDetected = (result) => {
    const { onDetected } = this.props;
    this.setState({ loading: true });

    Quagga.offDetected(this.onDetected);
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
            <b>Ein Fehler ist aufgetreten</b>
            <ErrorDescription>
              Bitte gebe dieser Website Zugriff auf die Kamera.
            </ErrorDescription>
          </FlexContent>
        )}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <Camera id="camera" visible={ready}><video playsInline autoPlay /></Camera>
      </>
    );
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired,
};

export default Scanner;
