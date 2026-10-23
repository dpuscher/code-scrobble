import { NextRequest } from 'next/server';
import { setCookies, startRequest } from './next';

type RouteHandler = (request: NextRequest, context: { params: Promise<never> }) => Response | Promise<Response>;

type Options = {
  method?: string;
  /** Path and query, e.g. `/api/search/x?format=CD`. */
  url?: string;
  params?: Record<string, string>;
  body?: unknown;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
};

/** Calls a route handler as Next.js would, with the cookies of a request. */
export async function callRoute(handler: RouteHandler, {
  method = 'GET', url = '/api/test', params = {}, body, cookies = {}, headers = {},
}: Options = {}) {
  startRequest(cookies);
  const request = new NextRequest(new URL(url, 'http://codescrobble.test'), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const response = await handler(request, { params: Promise.resolve(params as never) });
  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) as unknown : undefined,
    redirect: response.headers.get('location'),
    cookies: [...setCookies],
  };
}

/** The `sid` cookie set while handling the last request. */
export const sessionCookie = () => setCookies.find(({ name }) => name === 'sid');
