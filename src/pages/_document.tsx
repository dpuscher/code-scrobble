import Document, {
  type DocumentContext, type DocumentInitialProps, Head, Html, Main, NextScript,
} from 'next/document';

const isSafari = (userAgent = ''): boolean => /Version\/([0-9._]+).*Safari/.test(userAgent);

const splashScreens: [string, number, number, number][] = [
  ['iphone5', 320, 568, 2], ['iphone6', 375, 667, 2], ['iphoneplus', 621, 1104, 3],
  ['iphonex', 375, 812, 3], ['iphonexr', 414, 896, 2], ['iphonexsmax', 414, 896, 3],
  ['ipad', 768, 1024, 2], ['ipadpro1', 834, 1112, 2], ['ipadpro3', 834, 1194, 2],
  ['ipadpro2', 1024, 1366, 2],
];

type Props = DocumentInitialProps & { nonce?: string; showManifest: boolean };

export default class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext): Promise<Props> {
    const initialProps = await Document.getInitialProps(ctx);
    return {
      ...initialProps,
      // Set by src/proxy.ts for the Content-Security-Policy.
      nonce: ctx.req?.headers['x-nonce'] as string | undefined,
      showManifest: !isSafari(ctx.req?.headers['user-agent']),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head nonce={this.props.nonce}>
          <link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon-16x16.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon-32x32.png" />
          <link rel="mask-icon" href="/static/safari-pinned-tab.svg" color="#b53a3a" />
          <link rel="shortcut icon" href="/static/favicon.ico" />
          <meta name="application-name" content="CodeScrobble" />
          <meta name="description" content="CodeScrobble makes it easy to scrobble your CD or vinyl records on Last.fm. Just scan the barcode with your smartphone camera ♫" />
          <meta name="msapplication-config" content="/static/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#ffc40d" />
          <meta name="theme-color" content="#1d1e22" />
          {this.props.showManifest && <link rel="manifest" href="/static/site.webmanifest" />}
          {splashScreens.map(([name, width, height, ratio]) => (
            <link
              key={name}
              href={`/static/${name}_splash.png`}
              media={`(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio})`}
              rel="apple-touch-startup-image"
            />
          ))}
        </Head>
        <body>
          <Main />
          <NextScript nonce={this.props.nonce} />
        </body>
      </Html>
    );
  }
}
