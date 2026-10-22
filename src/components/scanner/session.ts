/** A running camera scan, started by one of the scanner engines. */
export type ScanSession = {
  /** The camera's video track, for the torch. */
  track: MediaStreamTrack | null;
  stop: () => void;
};

export type DetectedHandler = (barcode: string) => void;

const EAN = /^(\d{8}|\d{13})$/;

export const isEan = (code: string) => EAN.test(code);
