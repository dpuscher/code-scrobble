// Shared by the page (zxingDetector.ts) and the ZXing worker.

/**
 * A camera frame for the worker: an ImageBitmap it scales itself, or ImageData
 * already scaled by the page where workers have no 2D OffscreenCanvas.
 */
export type WorkerRequest = { type: 'init' } | { type: 'detect'; frame: ImageBitmap | ImageData };
export type WorkerResponse = { codes: string[] } | { error: string };

// Frames are scaled down to this width before decoding; plenty for a barcode
// that fills a third of the picture.
const MAX_WIDTH = 1280;

export function scaledSize(width: number, height: number) {
  const scale = Math.min(1, MAX_WIDTH / width);
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}
