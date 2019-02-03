import React from 'react';
import Quagga from 'quagga';
import styled from 'styled-components';
import { grey, yellow } from '../../lib/colors';
import Spinner from '../layout/Spinner';
import ErrorIconSVG from '../icons/ErrorIcon';

const ErrorIcon = styled(ErrorIconSVG)`
  width: 30%;
  height: auto;
  margin-bottom: 15px;
`;

const ErrorDescription = styled.div`
  margin: 10px 0;
`;

const Camera = styled.div`
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  position: absolute;
  width: 100%;
  height: 100%;

  video, canvas {
    width: 100%;
    height: 100%;
  }
`;

const Wrapper = styled.div`
  position: relative;
  width: 600px;
  max-width: 80%;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: ${grey};
`;

const HeightWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;

const Error = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 10%;
  position: absolute;
  width: 100%;
  height: 100%;
  text-align: center;
`;

const Loading = styled(Spinner)`
  width: 30%;
  height: 30%;
`;

const LoadingWrapper = styled.div`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

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
    Quagga.offDetected(this.onDetected);
    this.props.onDetected(result);
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


export default Scanner;
