import PropTypes from 'prop-types';
import React from 'react';
import Quagga from 'quagga';
import { yellow } from '../../lib/colors';
import {
  Camera, Error, ErrorDescription, ErrorIcon, HeightWrapper, Loading, LoadingWrapper, Wrapper,
} from './styles/Scanner.styles';

class Scanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      videoError: false,
      error: '',
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
          console.error(err.message);
          this.setState({ videoError: true, error: err.message });
          return;
        }
        this.onInitSuccess();
      });
      Quagga.onDetected(this.onDetected);
    }
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
      <Wrapper>
        <HeightWrapper>
          {loading && <LoadingWrapper><Loading size="300" /></LoadingWrapper> }
          {videoError && (
            <Error>
              <ErrorIcon color={yellow} />
              <b>Ein Fehler ist aufgetreten</b>
              {/* Bitte gebe dieser Website Zugriff auf die Kamera. */}
              <ErrorDescription>{this.state.error}</ErrorDescription>
            </Error>
          )}
          <Camera id="camera" visible={ready}><video playsinline autoPlay /></Camera>
        </HeightWrapper>
      </Wrapper>
    );
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired,
};

export default Scanner;
