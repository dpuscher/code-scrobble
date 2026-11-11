/**
 * Rejects cross-site state-changing requests (CSRF): the Origin browsers send
 * with every POST/DELETE must match the host the request was made to.
 * Requests without Origin (curl, tests) cannot carry a victim's cookies.
 * Server actions get the same check from Next.js.
 */
export function isSameOrigin(headers: Headers) {
  const origin = headers.get('origin');
  if (!origin) return true;
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
