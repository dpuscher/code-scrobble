import { afterAll, beforeEach } from 'vitest';
import { resetTestDb, closeTestDb } from './db';

process.env.LASTFM_KEY = 'test-key';
process.env.LASTFM_SECRET = 'test-secret';
process.env.DISCOGS_KEY = 'discogs-key';
process.env.DISCOGS_SECRET = 'discogs-secret';
process.env.LASTFM_API_URL = 'https://lastfm.test/2.0/';
process.env.DISCOGS_API_URL = 'https://discogs.test';

beforeEach(resetTestDb);
afterAll(closeTestDb);
