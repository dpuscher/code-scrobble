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
            width: 600,
            height: 600,
          },
        },
        numOfWorkers: 1,
        locate: true,
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'code_128_reader'],
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
              <ErrorDescription>Bitte gebe dieser Website Zugriff auf die Kamera.</ErrorDescription>
            </Error>
          )}
          <Camera id="camera" visible={ready} />
        </HeightWrapper>
      </Wrapper>
    );
  }
}

Scanner.propTypes = {
  onDetected: PropTypes.func.isRequired,
};

export default Scanner;
