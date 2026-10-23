import type { NextRequest } from 'next/server';
import type { User } from './db/schema';
import { isSameOrigin } from './origin';
import { currentUser } from './session';

type Handler<P> = (request: NextRequest, user: User, params: P) => Response | Promise<Response>;

export const json = (data: unknown, status = 200) => Response.json(data, { status });

/**
 * Wraps authenticated JSON route handlers: rejects anonymous and cross-site
 * requests and turns unexpected errors into a 500.
 */
export function authenticated<P extends Record<string, string> = Record<string, never>>(handler: Handler<P>) {
  return async (request: NextRequest, context: { params: Promise<P> }) => {
    if (request.method !== 'GET' && !isSameOrigin(request.headers)) return json({ error: 'Forbidden' }, 403);
    try {
      const user = await currentUser();
      if (!user) return json({ error: 'Unauthorized' }, 401);
      return await handler(request, user, await context.params);
    } catch (error) {
      // The path is a parameter, not part of the format string: a `%s` in it
      // would otherwise pull `error` into the message.
      console.error('%s %s failed', request.method, request.nextUrl.pathname, error);
      return json({ error: 'Internal server error' }, 500);
    }
  };
}
