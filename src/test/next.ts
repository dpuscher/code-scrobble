// Stands in for next/headers in server tests (see setup-server.ts): the
// cookies of the current request, and the ones set while handling it.

type Cookie = { name: string; value: string; maxAge?: number } & Record<string, unknown>;

const requestCookies = new Map<string, string>();
/** Cookies set since the last `startRequest()`. */
export const setCookies: Cookie[] = [];

/** Starts a new request with these cookies. */
export function startRequest(cookies: Record<string, string> = {}) {
  requestCookies.clear();
  Object.entries(cookies).forEach(([name, value]) => requestCookies.set(name, value));
  setCookies.length = 0;
}

const cookieStore = {
  get: (name: string) => (requestCookies.has(name) ? { name, value: requestCookies.get(name)! } : undefined),
  has: (name: string) => requestCookies.has(name),
  set(...args: [Cookie] | [string, string, Omit<Cookie, 'name' | 'value'>?]) {
    const cookie = typeof args[0] === 'string' ? { name: args[0], value: args[1]!, ...args[2] } : args[0];
    setCookies.push(cookie);
    // Later reads in the same request see it, like in Next.js.
    if (cookie.maxAge === 0) requestCookies.delete(cookie.name);
    else requestCookies.set(cookie.name, cookie.value);
  },
  delete(name: string) { cookieStore.set({ name, value: '', maxAge: 0 }); },
};

export const nextHeaders = {
  cookies: async () => cookieStore,
  headers: async () => new Headers(),
};
