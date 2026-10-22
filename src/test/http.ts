import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type Options = {
  method?: string;
  query?: Record<string, string>;
  body?: unknown;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
};

/** Minimal stand-in for Next.js' API request/response objects. */
export async function callApi(handler: NextApiHandler, {
  method = 'GET', query = {}, body, cookies = {}, headers: requestHeaders = {},
}: Options = {}) {
  const headers: Record<string, string | string[]> = {};
  const result = {
    status: 200, body: undefined as unknown, headers, redirect: undefined as string | undefined,
  };
  const req = {
    method, query, body, cookies, headers: requestHeaders, url: '/api/test',
  } as unknown as NextApiRequest;
  const res = { headersSent: false } as { headersSent: boolean } & Record<string, unknown>;
  Object.assign(res, {
    status(code: number) { result.status = code; return res; },
    json(data: unknown) { result.body = data; res.headersSent = true; return res; },
    end() { res.headersSent = true; return res; },
    redirect(status: number, url: string) { result.status = status; result.redirect = url; return res; },
    setHeader(name: string, value: string) { headers[name.toLowerCase()] = value; return res; },
    appendHeader(name: string, value: string) {
      const key = name.toLowerCase();
      headers[key] = [...([] as string[]).concat(headers[key] ?? []), value];
      return res;
    },
  });
  await handler(req, res as unknown as NextApiResponse);
  return result;
}

/** Extracts `sid` from Set-Cookie headers. */
export const sessionCookie = (headers: Record<string, string | string[]>) => (
  ([] as string[]).concat(headers['set-cookie'] ?? [])
    .map((c) => /^sid=([^;]*)/.exec(c)?.[1])
    .find(Boolean)
);
