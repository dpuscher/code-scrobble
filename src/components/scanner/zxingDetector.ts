import { ReaderUnavailableError, type Detector } from './session';
import { scaledSize, type WorkerRequest, type WorkerResponse } from './zxing.shared';

// The worker scales frames itself where it has a 2D OffscreenCanvas (Safari
// 16.4+, Chrome, Firefox); older browsers scale them on the page.
function workerCanScale() {
  try {
    return typeof OffscreenCanvas !== 'undefined'
      && typeof createImageBitmap === 'function'
      && !!new OffscreenCanvas(1, 1).getContext('2d');
  } catch {
    return false;
  }
}

/** Scaled-down pixels of the current video frame, read on the page. */
function frameGrabber() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  return (video: HTMLVideoElement) => {
    const { width, height } = scaledSize(video.videoWidth, video.videoHeight);
    if (!context || !width || !height) throw new Error('No video frame yet');
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    context.drawImage(video, 0, 0, width, height);
    return context.getImageData(0, 0, width, height);
  };
}

/**
 * ZXing (WebAssembly) for browsers without a built-in barcode reader (iOS,
 * Firefox). It runs in a worker, so decoding never blocks taps or rendering.
 */
export async function createZXingDetector(): Promise<Detector> {
  if (typeof WebAssembly === 'undefined' || typeof Worker === 'undefined') {
    throw new ReaderUnavailableError('No WebAssembly or Web Worker support');
  }
  let worker: Worker;
  try {
    worker = new Worker(new URL('./zxing.worker.ts', import.meta.url), { type: 'module' });
  } catch (error) {
    throw new ReaderUnavailableError('Could not start the barcode reader', { cause: error });
  }
  // The scan loop waits for each answer, so there is one request at a time.
  const request = (message: WorkerRequest, transfer: Transferable[] = []) => new Promise<string[]>((resolve, reject) => {
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      if ('error' in data) reject(new Error(data.error));
      else resolve(data.codes);
    };
    worker.onerror = (event) => reject(new Error(event.message));
    worker.postMessage(message, transfer);
  });

  try {
    await request({ type: 'init' });
  } catch (error) {
    worker.terminate();
    throw new ReaderUnavailableError('Could not start the barcode reader', { cause: error });
  }
  const grab = workerCanScale() ? null : frameGrabber();
  return {
    detect: async (video) => {
      if (grab) {
        const image = grab(video);
        return (await request({ type: 'detect', frame: image }, [image.data.buffer as ArrayBuffer]))
          .map((rawValue) => ({ rawValue }));
      }
      const frame = await createImageBitmap(video);
      return (await request({ type: 'detect', frame }, [frame])).map((rawValue) => ({ rawValue }));
    },
    close: () => worker.terminate(),
  };
}
