/**
 * Stand-in for the Last.fm and Discogs APIs so the app can run end-to-end
 * without network access or real credentials.
 *
 *   /lastfm/auth/   Last.fm web auth page; approves immediately
 *   /lastfm/api/    Last.fm web service (auth.getSession, user.getInfo, track.scrobble)
 *   /discogs/...    Discogs database search and release endpoints
 *   /__scrobbles    GET: scrobbles received so far, DELETE: reset
 *
 * Run with `node e2e/mock-server.ts` (Node 24 strips the types).
 */
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { fixtures, MOCK_PORT, MOCK_USER } from './fixtures.ts';

type Scrobble = Record<string, string>;
let scrobbles: Scrobble[] = [];

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return new URLSearchParams(Buffer.concat(chunks).toString());
}

function lastfm(params: URLSearchParams, res: ServerResponse) {
  switch (params.get('method')) {
    case 'auth.getSession':
      if (!params.get('api_sig')) return send(res, 200, { error: 13, message: 'Invalid method signature' });
      return send(res, 200, { session: { name: MOCK_USER.name, key: MOCK_USER.sessionKey, subscriber: 0 } });
    case 'user.getInfo':
      return send(res, 200, {
        user: {
          name: MOCK_USER.name,
          url: `https://www.last.fm/user/${MOCK_USER.name}`,
          image: ['small', 'medium', 'large', 'extralarge'].map((size) => ({ size, '#text': MOCK_USER.avatar })),
        },
      });
    case 'track.scrobble': {
      if (params.get('sk') !== MOCK_USER.sessionKey) return send(res, 200, { error: 9, message: 'Invalid session key' });
      const batch: Record<number, Scrobble> = {};
      params.forEach((value, key) => {
        const match = /^(\w+)\[(\d+)\]$/.exec(key);
        if (match) (batch[Number(match[2])] ??= {})[match[1]] = value;
      });
      const received = Object.values(batch);
      scrobbles.push(...received);
      return send(res, 200, { scrobbles: { '@attr': { accepted: received.length, ignored: 0 } } });
    }
    default:
      return send(res, 200, { error: 3, message: 'Invalid method' });
  }
}

function discogs(url: URL, res: ServerResponse) {
  const release = /^\/discogs\/releases\/(\d+)$/.exec(url.pathname);
  if (release) {
    const data = fixtures.releases[Number(release[1])];
    return data ? send(res, 200, data) : send(res, 404, { message: 'Release not found.' });
  }
  if (url.pathname === '/discogs/database/search') {
    const barcode = url.searchParams.get('barcode');
    const query = url.searchParams.get('q')?.toLowerCase();
    const results = Object.values(fixtures.releases)
      .filter((r) => (barcode
        ? r.identifiers.some((i) => i.type === 'Barcode' && i.value.replace(/\D/g, '') === barcode)
        : query && `${r.artists[0].name} ${r.title}`.toLowerCase().includes(query)))
      .map((r) => ({
        id: r.id,
        title: `${r.artists[0].name} - ${r.title}`,
        thumb: r.images[0].uri,
        country: 'Germany',
        year: String(r.year),
        format: ['Vinyl', 'LP'],
        uri: `/release/${r.id}`,
        community: { have: 10, want: 5 },
      }));
    return send(res, 200, { results });
  }
  return send(res, 404, { message: 'Not found' });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
  try {
    if (url.pathname === '/lastfm/auth/') {
      // The real page asks the user to grant access, then redirects back.
      const cb = new URL(url.searchParams.get('cb') ?? '');
      cb.searchParams.set('token', 'mock-token');
      res.writeHead(302, { Location: cb.toString() });
      return res.end();
    }
    if (url.pathname === '/lastfm/api/') {
      const params = req.method === 'POST' ? await readBody(req) : url.searchParams;
      return lastfm(params, res);
    }
    if (url.pathname.startsWith('/discogs/')) return discogs(url, res);
    if (url.pathname === '/__scrobbles') {
      if (req.method === 'DELETE') scrobbles = [];
      return send(res, 200, scrobbles);
    }
    return send(res, 404, { message: 'Not found' });
  } catch (error) {
    return send(res, 500, { message: String(error) });
  }
});

server.listen(MOCK_PORT, () => console.log(`Mock APIs listening on http://localhost:${MOCK_PORT}`));
