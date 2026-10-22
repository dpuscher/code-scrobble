/**
 * Writes a Y4M video showing an EAN-13 barcode, for Chromium's fake camera
 * (--use-file-for-fake-video-capture). Lets the e2e tests exercise the real
 * scanner instead of skipping the camera.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = L.map((code) => code.replace(/./g, (bit) => (bit === '0' ? '1' : '0')));
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLG', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

export function ean13Modules(code: string) {
  if (!/^\d{13}$/.test(code)) throw new Error(`Not an EAN-13: ${code}`);
  const digits = [...code].map(Number);
  const [first, ...rest] = digits;
  const left = rest.slice(0, 6).map((d, i) => (PARITY[first][i] === 'L' ? L : G)[d]).join('');
  const right = rest.slice(6).map((d) => R[d]).join('');
  return `101${left}01010${right}101`;
}

export function writeBarcodeVideo(code: string, file: string, width = 1280, height = 720) {
  const modules = ean13Modules(code);
  const moduleWidth = 8;
  const barsWidth = modules.length * moduleWidth;
  const left = Math.floor((width - barsWidth) / 2);
  const top = Math.floor(height * 0.2);
  const bottom = Math.floor(height * 0.8);

  // 4:2:0 frame: full-resolution luma, neutral chroma.
  const luma = Buffer.alloc(width * height, 235);
  for (let y = top; y < bottom; y += 1) {
    for (let x = 0; x < barsWidth; x += 1) {
      if (modules[Math.floor(x / moduleWidth)] === '1') luma[y * width + left + x] = 16;
    }
  }
  const chroma = Buffer.alloc((width / 2) * (height / 2) * 2, 128);
  const frame = Buffer.concat([Buffer.from('FRAME\n'), luma, chroma]);

  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, Buffer.concat([
    Buffer.from(`YUV4MPEG2 W${width} H${height} F10:1 Ip A1:1 C420jpeg\n`),
    frame, frame,
  ]));
  return file;
}
