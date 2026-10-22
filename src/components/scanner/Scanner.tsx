import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { QuaggaJSResultObject } from '@ericblade/quagga2';
import ErrorMessage from '../layout/ErrorMessage';
import Loading from '../layout/Loading';

type Props = {
  onDetected: (barcode: string) => void;
};

type State = 'loading' | 'ready' | 'error';

/** Live camera preview that reports the first EAN-8/EAN-13 barcode it reads. */
const Scanner = ({ onDetected }: Props) => {
  const [state, setState] = useState<State>('loading');
  const cameraRef = useRef<HTMLDivElement>(null);
  const reportDetected = useEffectEvent((code: string) => onDetected(code));

  useEffect(() => {
    let active = true;
    let started = false;
    let quagga: typeof import('@ericblade/quagga2').default | undefined;

    const handleDetected = (result: QuaggaJSResultObject) => {
      const code = result.codeResult.code;
      if (!active || !code) return;
      active = false;
      quagga?.offDetected(handleDetected);
      setState('loading');
      reportDetected(code);
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('No camera API');
      // Loaded on demand: the decoder is only needed on the scan page.
      const { default: Quagga } = await import('@ericblade/quagga2');
      if (!active) return;
      quagga = Quagga;
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: cameraRef.current ?? undefined,
          constraints: {
            width: { min: 1280 },
            height: { min: 720 },
            facingMode: 'environment',
            frameRate: 15,
            aspectRatio: { min: 1, max: 2 },
          },
        },
        locator: { patchSize: 'large', halfSample: true },
        locate: true,
        frequency: 10,
        decoder: { readers: ['ean_8_reader', 'ean_reader'] },
      }, (error) => {
        if (!active) {
          if (!error) Quagga.stop();
          return;
        }
        if (error) {
          setState('error');
          return;
        }
        started = true;
        Quagga.onDetected(handleDetected);
        Quagga.start();
        setState('ready');
      });
    };
    start().catch(() => setState('error'));

    return () => {
      active = false;
      if (quagga) {
        quagga.offDetected(handleDetected);
        if (started) quagga.stop();
      }
    };
  }, []);

  return (
    <>
      {state === 'loading' && <Loading />}
      {state === 'error' && (
        <ErrorMessage
          title="An error occurred"
          description="Please make sure this website is allowed to use the camera."
        />
      )}
      <div
        ref={cameraRef}
        className={`absolute h-full w-full translate-z-0 [&_canvas,&_video]:absolute [&_canvas,&_video]:top-0 [&_canvas,&_video]:left-0 [&_canvas,&_video]:h-full [&_canvas,&_video]:w-full [&_canvas,&_video]:object-cover ${
          state === 'ready' ? 'visible' : 'invisible'
        }`}
      >
        <video playsInline autoPlay muted />
      </div>
    </>
  );
};

export default Scanner;
