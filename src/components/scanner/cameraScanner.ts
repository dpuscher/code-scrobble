import { toEan, type DetectedHandler, type Detector, type ScanSession } from './session';

const FORMATS = ['ean_13', 'ean_8', 'upc_a'];

/**
 * The browser's built-in barcode reader (Chrome on Android, among others),
 * or null where it is missing or can't read EAN-13.
 */
export async function createNativeDetector(): Promise<Detector | null> {
  if (typeof BarcodeDetector === 'undefined') return null;
  try {
    const supported = await BarcodeDetector.getSupportedFormats();
    const formats = FORMATS.filter((format) => supported.includes(format));
    if (!formats.includes('ean_13')) return null;
    return new BarcodeDetector({ formats });
  } catch {
    return null;
  }
}

type ScanOptions = {
  onDetected: DetectedHandler;
  /** Frames are skipped while this returns true. */
  isPaused?: () => boolean;
  /** The detector is ready and frames are being read. */
  onReaderReady?: () => void;
  /** The detector failed to start; the camera has been stopped. */
  onReaderError?: (error: unknown) => void;
};

/**
 * Streams the back camera into `video` and checks every new frame for a
 * barcode. Resolves once the camera plays; the detector may still be loading
 * (ZXing downloads its WebAssembly first), and reading starts when it's ready.
 */
export async function startScanner(
  detectorPromise: Promise<Detector>,
  video: HTMLVideoElement,
  {
    onDetected, isPaused = () => false, onReaderReady, onReaderError,
  }: ScanOptions,
): Promise<ScanSession> {
  // Its errors are handled below, once the camera is up; this keeps the
  // browser from reporting them as unhandled in the meantime.
  detectorPromise.catch(() => {});
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
  } catch (error) {
    detectorPromise.then((detector) => detector.close?.(), () => {});
    throw error;
  }

  let stopped = false;
  let detector: Detector | undefined;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    stream.getTracks().forEach((track) => track.stop());
    if (video.srcObject === stream) video.srcObject = null;
    detector?.close?.();
  };

  const nextFrame = (callback: () => void) => {
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(callback);
    else requestAnimationFrame(callback);
  };
  const scan = async () => {
    if (stopped || !detector) return;
    if (isPaused()) {
      nextFrame(scan);
      return;
    }
    try {
      const barcodes = await detector.detect(video);
      const code = barcodes.map((barcode) => toEan(barcode.rawValue)).find((ean) => ean !== null);
      if (code && !stopped && !isPaused()) {
        onDetected(code);
        return;
      }
    } catch {
      // Frames that can't be read yet (e.g. while the video starts) are skipped.
    }
    nextFrame(scan);
  };

  try {
    video.srcObject = stream;
    await video.play();
  } catch (error) {
    stop();
    detectorPromise.then((ready) => ready.close?.(), () => {});
    throw error;
  }

  detectorPromise.then((ready) => {
    if (stopped) {
      ready.close?.();
      return;
    }
    detector = ready;
    onReaderReady?.();
    nextFrame(scan);
  }, (error: unknown) => {
    if (stopped) return;
    stop();
    onReaderError?.(error);
  });
  return { track: stream.getVideoTracks()[0] ?? null, stop };
}
