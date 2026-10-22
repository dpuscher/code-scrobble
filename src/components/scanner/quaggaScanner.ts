import type { QuaggaJSResultObject } from '@ericblade/quagga2';
import type { DetectedHandler, ScanSession } from './session';

/** JavaScript decoder for browsers without a built-in barcode reader. */
export async function startQuaggaScanner(target: HTMLElement, onDetected: DetectedHandler): Promise<ScanSession> {
  // Loaded on demand: the decoder is only needed on the scan page, and only
  // where the browser can't read barcodes itself.
  const { default: Quagga } = await import('@ericblade/quagga2');

  await new Promise<void>((resolve, reject) => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target,
        constraints: {
          width: { min: 1280 },
          height: { min: 720 },
          facingMode: 'environment',
          frameRate: 15,
          aspectRatio: { min: 1, max: 2 },
        },
      },
      locator: { patchSize: 'large', halfSample: true },
      locate: true,
      frequency: 10,
      decoder: { readers: ['ean_8_reader', 'ean_reader'] },
    }, (error) => (error ? reject(error) : resolve()));
  });

  let stopped = false;
  const handleDetected = (result: QuaggaJSResultObject) => {
    const code = result.codeResult.code;
    if (stopped || !code) return;
    Quagga.offDetected(handleDetected);
    onDetected(code);
  };
  Quagga.onDetected(handleDetected);
  Quagga.start();

  return {
    track: Quagga.CameraAccess.getActiveTrack(),
    stop: () => {
      if (stopped) return;
      stopped = true;
      Quagga.offDetected(handleDetected);
      Quagga.stop();
    },
  };
}
