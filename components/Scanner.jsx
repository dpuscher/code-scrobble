import PropTypes from 'prop-types';
import React from 'react';
import Quagga from 'quagga';
import { yellow } from '../lib/colors';
import { Error, ErrorDescription, ErrorIcon } from './styles/Error.styles';
import { Camera, Loading, LoadingWrapper } from './styles/Scanner.styles';

class Scanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      videoError: false,
    };

    this.onInitSuccess = this.onInitSuccess.bind(this);
    this.onDetected = this.onDetected.bind(this);
  }

  componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      Quagga.init({
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: document.querySelector('#camera'),
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: 'environment',
            frameRate: 15,
            aspectRatio: { min: 1, max: 2 },
          },
        },
        locator: {
          patchSize: 'medium',
          halfSample: true,
        },
        numOfWorkers: 4,
        locate: true,
        frequency: 10,
        decoder: {
          readers: ['ean_reader'],
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

  onInitSuccess() {
    Quagga.start();
    this.setState({ init: true });
  }

  onDetected(result) {
    const { onDetected } = this.props;

    Quagga.offDetected(this.onDetected);
    onDetected(result);
  }

  render() {
    const { videoError, init } = this.state;
    const loading = !init && !videoError;
    const ready = init && !videoError;
    return (
      <>
        {loading && <LoadingWrapper><Loading size="300" /></LoadingWrapper> }
        {videoError && (
          <Error>
            <ErrorIcon color={yellow} />
            <b>Ein Fehler ist aufgetreten</b>
            <ErrorDescription>Bitte gebe dieser Website Zugriff auf die Kamera.</ErrorDescription>
          </Error>
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