/* eslint-disable no-underscore-dangle */

const redis = require('redis');
const Cache = require('../cache');

jest.mock('redis');

describe('cache', () => {
  beforeEach(() => {
    redis._get.mockClear();
    redis._set.mockClear();
    redis._reset();
  });

  describe('set', () => {
    it('writes given data to redis store', async () => {
      const key = 'foo';
      const value = ['bar'];

      await Cache.set(key, value);

      expect(redis._set.mock.calls.length).toBe(1);
      expect(redis._set.mock.calls[0][0]).toBe(key);
      expect(redis._set.mock.calls[0][1]).toBe(JSON.stringify(value));
      expect(redis._set.mock.calls[0][2]).toBe('EX');
    });

    it('passes given ttl to redis store', async () => {
      const key = 'foo';
      const value = ['bar'];
      const ttl = 1337;

      await Cache.set(key, value, ttl);

      expect(redis._set.mock.calls[0][3]).toBe(ttl);
    });

    it('uses 24 hours as default ttl', async () => {
      const key = 'foo';
      const value = ['bar'];

      await Cache.set(key, value);

      expect(redis._set.mock.calls[0][3]).toBe(24 * 60 * 60);
    });
  });

  describe('get', () => {
    it('queries data from redis store', async () => {
      const key = 'foo';

      try {
        await Cache.get(key);
      } catch (e) {
        // ignore errors
      }

      expect(redis._get.mock.calls.length).toBe(1);
      expect(redis._get.mock.calls[0][0]).toBe(key);
    });

    it('returns correct data from redis store after it was saved', async () => {
      const key = 'foo';
      const value = ['bar'];

      await Cache.set(key, value);
      const cachedData = await Cache.get(key);

      expect(cachedData).toEqual(value);
    });

    it('rejects the promise when no data is stored in redis', () => {
      const key = 'foo';

      expect(Cache.get(key)).rejects.toBeUndefined();
    });
  });
});
