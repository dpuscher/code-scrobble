import type { Metadata , Viewport } from "next";
import StyledComponentsRegistry from "./StyledComponentsRegistry";

export const metadata: Metadata = {
  title: "CodeScrobble ► Easily scrobble VINYL and CD to Last.fm",
  description:
    "CodeScrobble makes it easy to scrobble your CD or vinyl records on Last.fm. Just scan the barcode with your smartphone camera ♫",
  applicationName: "CodeScrobble",
  icons: {
    apple: "/static/apple-touch-icon.png",
    icon: [
      { url: "/static/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/static/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/static/favicon.ico",
    other: [{ rel: "mask-icon", url: "/static/safari-pinned-tab.svg", color: "#b53a3a" }],
  },
  manifest: "/static/site.webmanifest",
  other: {
    "msapplication-config": "/static/browserconfig.xml",
    "msapplication-TileColor": "#ffc40d",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d1e22",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
