import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { IoFlashlight, IoFlashlightOutline } from 'react-icons/io5';
import ErrorMessage from '../layout/ErrorMessage';
import Loading from '../layout/Loading';
import { createNativeDetector, startNativeScanner } from './nativeScanner';
import { startQuaggaScanner } from './quaggaScanner';
import type { ScanSession } from './session';

type Props = {
  onDetected: (barcode: string) => void;
};

type State = 'loading' | 'ready' | 'error';

const supportsTorch = (track: MediaStreamTrack) => 'getCapabilities' in track && !!track.getCapabilities().torch;

// Short buzz on a successful read. Browsers only allow it once the user has
// interacted with the page (and iOS not at all).
function vibrate() {
  if ('vibrate' in navigator && navigator.userActivation?.hasBeenActive) navigator.vibrate(40);
}

/**
 * Live camera preview that reports the first EAN-8/EAN-13 barcode it reads.
 * Uses the browser's built-in barcode reader where there is one, quagga2
 * otherwise.
 */
const Scanner = ({ onDetected }: Props) => {
  const [state, setState] = useState<State>('loading');
  // null while the camera has no torch.
  const [torch, setTorch] = useState<boolean | null>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const reportDetected = useEffectEvent((code: string) => onDetected(code));

  useEffect(() => {
    let active = true;
    let session: ScanSession | undefined;

    const handleDetected = (code: string) => {
      if (!active) return;
      active = false;
      vibrate();
      setTorch(null);
      setState('loading');
      reportDetected(code);
    };

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('No camera API');
      const video = videoRef.current;
      const camera = cameraRef.current;
      if (!video || !camera) return;
      const detector = await createNativeDetector();
      if (!active) return;
      const started = detector
        ? await startNativeScanner(detector, video, handleDetected)
        : await startQuaggaScanner(camera, handleDetected);
      if (!active) {
        started.stop();
        return;
      }
      session = started;
      trackRef.current = started.track;
      setState('ready');
      if (started.track && supportsTorch(started.track)) setTorch(false);
    };
    start().catch(() => {
      if (active) setState('error');
    });

    return () => {
      active = false;
      trackRef.current = null;
      session?.stop();
    };
  }, []);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track || torch === null) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch }] });
      setTorch(!torch);
    } catch {
      setTorch(null);
    }
  };

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
        <video ref={videoRef} playsInline autoPlay muted />
      </div>
      {state === 'ready' && (
        // Sweeping line that shows the camera is reading.
        <div aria-hidden className="pointer-events-none absolute inset-x-[18%] inset-y-[30%]">
          <div className="absolute inset-x-0 top-1/2 h-0.5 rounded-full bg-yellow/80 shadow-[0_0_12px_2px_var(--color-yellow)] motion-safe:animate-scan" />
        </div>
      )}
      {state === 'ready' && torch !== null && (
        <button
          type="button"
          aria-label="Flashlight"
          aria-pressed={torch}
          onClick={toggleTorch}
          className={`absolute bottom-[7%] left-1/2 z-1 flex size-12 -translate-x-1/2 items-center justify-center rounded-full backdrop-blur-[5px] transition-[background-color,color,box-shadow,scale] duration-150 ease-out active:scale-90 ${
            torch ? 'bg-yellow text-dark shadow-[0_0_16px_2px_var(--color-yellow)]' : 'bg-black/50 text-silver'
          }`}
        >
          {torch ? <IoFlashlight size="22" aria-hidden /> : <IoFlashlightOutline size="22" aria-hidden />}
        </button>
      )}
    </>
  );
};

export default Scanner;
