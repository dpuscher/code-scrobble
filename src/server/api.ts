import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import type { User } from './db/schema';
import { isSameOrigin } from './origin';
import { getSessionUser } from './session';

type Method = 'GET' | 'POST' | 'DELETE';
type Handler = (req: NextApiRequest, res: NextApiResponse, user: User) => unknown;

/**
 * Wraps authenticated JSON API routes: dispatches on method, rejects
 * anonymous requests and turns unexpected errors into a 500.
 */
export function authenticatedApi(handlers: Partial<Record<Method, Handler>>): NextApiHandler {
  return async (req, res) => {
    const handler = handlers[req.method as Method];
    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers).join(', '));
      return res.status(405).json({ error: 'Method not allowed' });
    }
    if (req.method !== 'GET' && !isSameOrigin(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const user = await getSessionUser(req, res);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });
      return await handler(req, res, user);
    } catch (error) {
      // The URL is a parameter, not part of the format string: a `%s` in it
      // would otherwise pull `error` into the message.
      console.error('%s %s failed', req.method, req.url, error);
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    }
  };
}
