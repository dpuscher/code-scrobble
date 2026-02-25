import * as redis from "redis";
import * as Cache from "../cache";

vi.mock("redis", async () => import("../__mocks__/redis"));

describe("cache", () => {
  beforeEach(() => {
    (redis as any)._get.mockClear();
    (redis as any)._set.mockClear();
    (redis as any)._reset();
  });

  describe("set", () => {
    it("writes given data to redis store", async () => {
      const key = "foo";
      const value = ["bar"];

      await Cache.set(key, value);

      expect((redis as any)._set.mock.calls.length).toBe(1);
      expect((redis as any)._set.mock.calls[0][0]).toBe(key);
      expect((redis as any)._set.mock.calls[0][1]).toBe(JSON.stringify(value));
      expect((redis as any)._set.mock.calls[0][2]).toEqual({ EX: 86400 });
    });

    it("passes given ttl to redis store", async () => {
      const key = "foo";
      const value = ["bar"];
      const ttl = 1337;

      await Cache.set(key, value, ttl);

      expect((redis as any)._set.mock.calls[0][2]).toEqual({ EX: ttl });
    });

    it("uses 24 hours as default ttl", async () => {
      const key = "foo";
      const value = ["bar"];

      await Cache.set(key, value);

      expect((redis as any)._set.mock.calls[0][2]).toEqual({ EX: 24 * 60 * 60 });
    });
  });

  describe("get", () => {
    it("queries data from redis store", async () => {
      const key = "foo";

      try {
        await Cache.get(key);
      } catch {
        // ignore errors
      }

      expect((redis as any)._get.mock.calls.length).toBe(1);
      expect((redis as any)._get.mock.calls[0][0]).toBe(key);
    });

    it("returns correct data from redis store after it was saved", async () => {
      const key = "foo";
      const value = ["bar"];

      await Cache.set(key, value);
      const cachedData = await Cache.get(key);

      expect(cachedData).toEqual(value);
    });

    it("rejects the promise when no data is stored in redis", async () => {
      const key = "foo";

      await expect(Cache.get(key)).rejects.toBeUndefined();
    });
  });
});
