// Shared by the page (zxingDetector.ts) and the ZXing worker.

/**
 * A camera frame for the worker: an ImageBitmap it scales itself, or ImageData
 * already scaled by the page where workers have no 2D OffscreenCanvas.
 */
export type WorkerRequest = { type: 'init' } | { type: 'detect'; frame: ImageBitmap | ImageData };
export type WorkerResponse = { codes: string[] } | { error: string };

// Frames are scaled down to this size on their longer side before decoding;
// plenty for a barcode that fills a third of the picture. Phones held upright
// deliver portrait frames, so the width alone is not enough.
const MAX_SIZE = 1280;

export function scaledSize(width: number, height: number) {
  const scale = Math.min(1, MAX_SIZE / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
