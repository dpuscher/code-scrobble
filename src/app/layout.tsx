import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'CodeScrobble ► Easily scrobble VINYL and CD to Last.fm',
  description: 'CodeScrobble makes it easy to scrobble your CD or vinyl records on Last.fm. Just scan the barcode with your smartphone camera ♫',
  applicationName: 'CodeScrobble',
  other: {
    'msapplication-config': '/static/browserconfig.xml',
    'msapplication-TileColor': '#ffc40d',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1d1e22',
};

const splashScreens: [string, number, number, number][] = [
  ['iphone5', 320, 568, 2], ['iphone6', 375, 667, 2], ['iphoneplus', 621, 1104, 3],
  ['iphonex', 375, 812, 3], ['iphonexr', 414, 896, 2], ['iphonexsmax', 414, 896, 3],
  ['ipad', 768, 1024, 2], ['ipadpro1', 834, 1112, 2], ['ipadpro3', 834, 1194, 2],
  ['ipadpro2', 1024, 1366, 2],
];

const isSafari = (userAgent: string) => /Version\/([0-9._]+).*Safari/.test(userAgent);

// Reading the request headers renders every page per request, which the
// Content-Security-Policy nonce needs (see src/proxy.ts).
export default async function RootLayout({ children }: { children: ReactNode }) {
  const userAgent = (await headers()).get('user-agent') ?? '';
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png" />
        <link rel="mask-icon" href="/static/safari-pinned-tab.svg" color="#b53a3a" />
        <link rel="shortcut icon" href="/static/favicon.ico" />
        {/* As in CodeScrobble 1.x, Safari gets no web app manifest. */}
        {!isSafari(userAgent) && <link rel="manifest" href="/static/site.webmanifest" />}
        {splashScreens.map(([name, width, height, ratio]) => (
          <link
            key={name}
            href={`/static/${name}_splash.png`}
            media={`(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio})`}
            rel="apple-touch-startup-image"
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
