/**
 * A page with the barcodes of dev/catalog.ts, to hold in front of the camera
 * when trying the scanner. Served by the mock server at /barcodes.
 */
import { ean13Modules } from '../e2e/support/barcode-video.ts';
import { catalog } from './catalog.ts';

const barcode = (code: string) => {
  const modules = ean13Modules(code);
  const bars = [...modules].map((bit, x) => (bit === '1' ? `<rect x="${x + 10}" width="1" height="60"/>` : '')).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${modules.length + 20} 72" width="300">
    <rect width="100%" height="100%" fill="#fff"/><g fill="#000">${bars}</g>
    <text x="50%" y="70" text-anchor="middle" font-family="monospace" font-size="8">${code}</text></svg>`;
};

export const barcodesPage = () => `<!doctype html><meta charset="utf-8"><title>CodeScrobble test barcodes</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font:15px system-ui;margin:20px;background:#eee}figure{display:inline-block;margin:10px;padding:15px;background:#fff;border-radius:8px}</style>
<p>Scan these with the laptop camera (e.g. open this page on your phone), or open
<code>http://localhost:3000/detected/&lt;barcode&gt;</code> directly.</p>
${catalog.map((r) => `<figure>${barcode(r.barcode)}<figcaption>${r.artist} – ${r.title}</figcaption></figure>`).join('\n')}
`;
