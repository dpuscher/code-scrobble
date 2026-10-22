import { isEan, type DetectedHandler, type ScanSession } from './session';

const FORMATS = ['ean_13', 'ean_8'];

/**
 * The browser's built-in barcode reader (Chrome on Android, among others),
 * or null where it is missing or can't read EAN-13.
 */
export async function createNativeDetector() {
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

/** Streams the back camera into `video` and checks every new frame for a barcode. */
export async function startNativeScanner(
  detector: BarcodeDetector,
  video: HTMLVideoElement,
  onDetected: DetectedHandler,
): Promise<ScanSession> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'environment',
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
  });
  let stopped = false;
  const stop = () => {
    stopped = true;
    stream.getTracks().forEach((track) => track.stop());
    if (video.srcObject === stream) video.srcObject = null;
  };

  const nextFrame = (callback: () => void) => {
    if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(callback);
    else requestAnimationFrame(callback);
  };
  const scan = async () => {
    if (stopped) return;
    try {
      const barcodes = await detector.detect(video);
      const code = barcodes.map((barcode) => barcode.rawValue).find(isEan);
      if (code && !stopped) {
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
    throw error;
  }
  nextFrame(scan);
  return { track: stream.getVideoTracks()[0] ?? null, stop };
}
