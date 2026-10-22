import type { IncomingMessage } from 'node:http';

/**
 * Rejects cross-site state-changing requests (CSRF): the Origin browsers send
 * with every POST/DELETE must match the host the request was made to.
 * Requests without Origin (curl, tests) cannot carry a victim's cookies.
 */
export function isSameOrigin(req: IncomingMessage) {
  const { origin } = req.headers;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] ?? req.headers.host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
