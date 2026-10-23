import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { IoFlashlight, IoFlashlightOutline } from 'react-icons/io5';
import ErrorMessage from '../layout/ErrorMessage';
import Loading from '../layout/Loading';
import { createNativeDetector, startScanner } from './cameraScanner';
import { startPreview } from './previewCanvas';
import { ReaderUnavailableError, type ScanSession } from './session';

type Props = {
  onDetected: (barcode: string) => void;
  /** Keeps the camera running but ignores barcodes, e.g. behind the search. */
  paused?: boolean;
};

type State = 'loading' | 'ready' | 'error' | 'unsupported';

const supportsTorch = (track: MediaStreamTrack) => 'getCapabilities' in track && !!track.getCapabilities().torch;

// Short buzz on a successful read. Browsers only allow it once the user has
// interacted with the page (and iOS not at all).
function vibrate() {
  if ('vibrate' in navigator && navigator.userActivation?.hasBeenActive) navigator.vibrate(40);
}

/**
 * Live camera preview that reports the first EAN-8/EAN-13 barcode it reads.
 * Uses the browser's built-in barcode reader where there is one, ZXing in a
 * worker otherwise.
 */
const Scanner = ({ onDetected, paused = false }: Props) => {
  const [state, setState] = useState<State>('loading');
  // null while the camera has no torch.
  const [torch, setTorch] = useState<boolean | null>(null);
  // The camera shows before the reader is ready (ZXing loads its WebAssembly).
  const [reading, setReading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const reportDetected = useEffectEvent((code: string) => onDetected(code));
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let active = true;
    let session: ScanSession | undefined;
    let stopPreview: (() => void) | undefined;

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
      const canvas = canvasRef.current;
      if (!video || !canvas) return;
      // The ZXing fallback (and its WebAssembly) is only loaded where needed.
      const detector = createNativeDetector().then((native) => native
        ?? import('./zxingDetector').then(({ createZXingDetector }) => createZXingDetector()));
      const started = await startScanner(detector, video, {
        onDetected: handleDetected,
        isPaused: () => pausedRef.current,
        onReaderReady: () => {
          if (active) setReading(true);
        },
        onReaderError: (error) => {
          if (!active) return;
          active = false;
          stopPreview?.();
          setTorch(null);
          setState(error instanceof ReaderUnavailableError ? 'unsupported' : 'error');
        },
      });
      if (!active) {
        started.stop();
        return;
      }
      session = started;
      stopPreview = startPreview(video, canvas);
      trackRef.current = started.track;
      setState('ready');
      if (started.track && supportsTorch(started.track)) setTorch(false);
    };
    start().catch((error: unknown) => {
      if (active) setState(error instanceof ReaderUnavailableError ? 'unsupported' : 'error');
    });

    return () => {
      active = false;
      trackRef.current = null;
      stopPreview?.();
      session?.stop();
    };
  }, []);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (!track || torch === null) return;
    const on = !torch;
    // Shows the new state at once: the light itself takes about a second on iOS.
    setTorch(on);
    try {
      await track.applyConstraints({ advanced: [{ torch: on }] });
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
      {state === 'unsupported' && (
        <ErrorMessage
          title="Scanning is not supported"
          description="This browser can't read barcodes. Please search for the release instead, or update your browser."
        />
      )}
      {/* The camera is shown through the canvas (see previewCanvas.ts); the
          video only feeds it and the barcode reader. */}
      <div className={`absolute inset-0 translate-z-0 ${state === 'ready' ? 'visible' : 'invisible'}`}>
        <video ref={videoRef} playsInline autoPlay muted className="absolute inset-0 h-full w-full opacity-0" />
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      </div>
      {state === 'ready' && reading && (
        // Sweeping line that shows the camera is reading. The full-height
        // wrapper moves, so translateY(100%) spans the whole scan area.
        <div aria-hidden className="pointer-events-none absolute inset-x-[18%] inset-y-[30%]">
          <div className="absolute inset-0 motion-safe:animate-scan motion-reduce:translate-y-1/2">
            <div className="h-0.5 rounded-full bg-yellow/80 shadow-[0_0_12px_2px_var(--color-yellow)]" />
          </div>
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
