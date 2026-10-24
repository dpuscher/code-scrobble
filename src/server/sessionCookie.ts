import { config } from './config';

export const SESSION_COOKIE = 'sid';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

/** The session cookie; a max age of 0 deletes it. */
export const sessionCookie = (value: string, maxAgeMs = SESSION_MAX_AGE) => ({
  name: SESSION_COOKIE,
  value,
  path: '/',
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: Math.floor(maxAgeMs / 1000),
  secure: config.secureCookies,
});
