// Browser APIs used by the scanner that TypeScript's DOM types don't cover yet.

/** Shape Detection API, https://wicg.github.io/shape-detection-api/ */
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetector {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

declare const BarcodeDetector: {
  prototype: BarcodeDetector;
  new (options?: { formats?: string[] }): BarcodeDetector;
  getSupportedFormats(): Promise<string[]>;
} | undefined;

/** Image Capture extension of MediaStreamTrack, https://w3c.github.io/mediacapture-image/ */
interface MediaTrackCapabilities {
  torch?: boolean;
}

interface MediaTrackConstraintSet {
  torch?: ConstrainBoolean;
}
