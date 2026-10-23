import { prepareZXingModule, readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import wasmUrl from 'zxing-wasm/reader/zxing_reader.wasm';
import { scaledSize, type WorkerRequest, type WorkerResponse } from './zxing.shared';

const options: ReaderOptions = {
  formats: ['EAN13', 'EAN8', 'UPCA'],
  tryHarder: true,
  maxNumberOfSymbols: 1,
};

let canvas: OffscreenCanvas | undefined;
let context: OffscreenCanvasRenderingContext2D | null = null;

function toImageData(frame: ImageBitmap) {
  const { width, height } = scaledSize(frame.width, frame.height);
  canvas ??= new OffscreenCanvas(width, height);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  context ??= canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('No 2D canvas in this worker');
  context.drawImage(frame, 0, 0, width, height);
  frame.close();
  return context.getImageData(0, 0, width, height);
}

async function read(frame: ImageBitmap | ImageData) {
  const image = frame instanceof ImageData ? frame : toImageData(frame);
  const results = await readBarcodes(image, options);
  return results.filter((result) => result.isValid).map((result) => result.text);
}

const reply = (response: WorkerResponse) => postMessage(response);

addEventListener('message', async ({ data }: MessageEvent<WorkerRequest>) => {
  try {
    if (data.type === 'init') {
      // Served by this app instead of the default CDN.
      const wasm = new URL(wasmUrl, location.origin).href;
      await prepareZXingModule({
        overrides: { locateFile: (path: string, prefix: string) => (path.endsWith('.wasm') ? wasm : prefix + path) },
        fireImmediately: true,
      });
      reply({ codes: [] });
    } else {
      reply({ codes: await read(data.frame) });
    }
  } catch (error) {
    reply({ error: String(error) });
  }
});
