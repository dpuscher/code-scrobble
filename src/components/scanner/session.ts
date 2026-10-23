/** Reads barcodes from the camera video: the browser's BarcodeDetector or the ZXing worker. */
export type Detector = {
  detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
  close?: () => void;
};

/** A running camera scan. */
export type ScanSession = {
  /** The camera's video track, for the torch. */
  track: MediaStreamTrack | null;
  stop: () => void;
};

export type DetectedHandler = (barcode: string) => void;

/** The browser can't run a barcode reader at all (no WebAssembly or workers). */
export class ReaderUnavailableError extends Error {
  name = 'ReaderUnavailableError';
}

/** EAN-8 or EAN-13, with UPC-A (US releases) written as EAN-13 with a leading zero. */
export function toEan(code: string) {
  if (/^\d{12}$/.test(code)) return `0${code}`;
  return /^(\d{8}|\d{13})$/.test(code) ? code : null;
}
