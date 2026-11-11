import { afterAll, beforeEach, vi } from 'vitest';
import { resetTestDb, closeTestDb } from './db';
import { startRequest } from './next';

vi.mock('next/headers', async () => (await import('./next')).nextHeaders);
// Revalidating needs a running Next.js server; the pages it refreshes are tested end to end.
vi.mock('next/cache', () => ({ revalidatePath: () => {} }));

process.env.LASTFM_KEY = 'test-key';
process.env.LASTFM_SECRET = 'test-secret';
process.env.DISCOGS_KEY = 'discogs-key';
process.env.DISCOGS_SECRET = 'discogs-secret';
process.env.LASTFM_API_URL = 'https://lastfm.test/2.0/';
process.env.DISCOGS_API_URL = 'https://discogs.test';

beforeEach(resetTestDb);
beforeEach(() => startRequest());
afterAll(closeTestDb);
