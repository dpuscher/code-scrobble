function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

// Read lazily so `next build` works without runtime secrets.
export const config = {
  get serverUrl() {
    return (process.env.SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  },
  get secureCookies() {
    return this.serverUrl.startsWith('https://');
  },
  lastfm: {
    get key() { return required('LASTFM_KEY'); },
    get secret() { return required('LASTFM_SECRET'); },
    // Overridable so tests can point the app at a mock server.
    get apiUrl() { return process.env.LASTFM_API_URL ?? 'https://ws.audioscrobbler.com/2.0/'; },
    get authUrl() { return process.env.LASTFM_AUTH_URL ?? 'https://www.last.fm/api/auth/'; },
    // Never scrobble from a dev machine by accident.
    get scrobblingEnabled() {
      return process.env.NODE_ENV === 'production' && process.env.LASTFM_SCROBBLING !== 'off';
    },
  },
  discogs: {
    get key() { return required('DISCOGS_KEY'); },
    get secret() { return required('DISCOGS_SECRET'); },
    get apiUrl() { return (process.env.DISCOGS_API_URL ?? 'https://api.discogs.com').replace(/\/$/, ''); },
  },
};
