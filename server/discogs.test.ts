const discogsMocks = vi.hoisted(() => {
  const search = vi.fn();
  const getRelease = vi.fn();
  const getMaster = vi.fn();
  const database = {
    search,
    getRelease,
    getMaster,
  };

  const client = vi.fn().mockImplementation(function MockDiscogsClient() {
    return {
      database: () => database,
    };
  });

  const cacheGet = vi.fn();
  const cacheSet = vi.fn();

  return {
    search,
    getRelease,
    getMaster,
    client,
    cacheGet,
    cacheSet,
  };
});

vi.mock("disconnect", () => ({
  Client: discogsMocks.client,
}));

vi.mock("./cache", () => ({
  get: discogsMocks.cacheGet,
  set: discogsMocks.cacheSet,
}));

import * as Discogs from "./discogs";

describe("server/discogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    discogsMocks.cacheSet.mockResolvedValue("OK");
  });

  describe("barcode", () => {
    it("returns cached value without querying Discogs", async () => {
      discogsMocks.cacheGet.mockResolvedValue(524_045);

      const result = await Discogs.barcode("731452101716");

      expect(result).toBe(524_045);
      expect(discogsMocks.cacheGet).toHaveBeenCalledWith("barcode--731452101716");
      expect(discogsMocks.search).not.toHaveBeenCalled();
      expect(discogsMocks.cacheSet).not.toHaveBeenCalled();
    });

    it("queries Discogs on cache miss, ranks by community, and caches winner", async () => {
      discogsMocks.cacheGet.mockResolvedValue(undefined);
      discogsMocks.search.mockImplementation(
        (_query: unknown, _params: unknown, callback: (error: unknown, data?: unknown) => void) => {
          callback(null, {
            results: [
              { id: 12_345, community: { have: 20, want: 2 } },
              { id: 524_045, community: { have: 120, want: 45 } },
              { id: 67_890, community: { have: 19, want: 99 } },
            ],
          });
        },
      );

      const result = await Discogs.barcode("731452101716");

      expect(result).toBe(524_045);
      expect(discogsMocks.search).toHaveBeenCalledWith(
        undefined,
        { barcode: "731452101716", type: "release" },
        expect.any(Function),
      );
      expect(discogsMocks.cacheSet).toHaveBeenCalledWith("barcode--731452101716", 524_045);
    });

    it("returns undefined when Discogs search has no results", async () => {
      discogsMocks.cacheGet.mockResolvedValue(undefined);
      discogsMocks.search.mockImplementation(
        (_query: unknown, _params: unknown, callback: (error: unknown, data?: unknown) => void) => {
          callback(null, { results: [] });
        },
      );

      const result = await Discogs.barcode("000000000000");

      expect(result).toBeUndefined();
      expect(discogsMocks.cacheSet).not.toHaveBeenCalled();
    });
  });

  describe("search", () => {
    it("returns cached results without querying Discogs", async () => {
      const cached = [
        {
          id: 524_045,
          title: "Die Ärzte - Die Bestie In Menschengestalt",
          thumb: "https://img.discogs.com/bestie-thumb.jpg",
          country: "Germany",
          year: "1993",
          format: "Vinyl, LP, Album, 32 4/3 RPM",
          uri: "https://www.discogs.com/release/524045-Die-Ärzte-Die-Bestie-In-Menschengestalt",
        },
      ];
      discogsMocks.cacheGet.mockResolvedValue(cached);

      const result = await Discogs.search("die bestie in menschengestalt");

      expect(result).toEqual(cached);
      expect(discogsMocks.search).not.toHaveBeenCalled();
    });

    it("maps Discogs results to app shape and caches them", async () => {
      discogsMocks.cacheGet.mockResolvedValue(undefined);
      discogsMocks.search.mockImplementation(
        (_query: unknown, _params: unknown, callback: (error: unknown, data?: unknown) => void) => {
          callback(null, {
            results: [
              {
                id: 524_045,
                title: "Die Ärzte - Die Bestie In Menschengestalt",
                thumb: "https://img.discogs.com/bestie-thumb.jpg",
                country: "Germany",
                year: 1993,
                format: ["Vinyl", "LP", "Album", "32 4/3 RPM"],
                uri: "https://www.discogs.com/release/524045-Die-Ärzte-Die-Bestie-In-Menschengestalt",
              },
            ],
          });
        },
      );

      const result = await Discogs.search("die bestie");

      expect(result).toEqual([
        {
          id: 524_045,
          title: "Die Ärzte - Die Bestie In Menschengestalt",
          thumb: "https://img.discogs.com/bestie-thumb.jpg",
          country: "Germany",
          year: "1993",
          format: "Vinyl, LP, Album, 32 4/3 RPM",
          uri: "https://www.discogs.com/release/524045-Die-Ärzte-Die-Bestie-In-Menschengestalt",
        },
      ]);
      expect(discogsMocks.cacheSet).toHaveBeenCalledWith("search--die bestie", result);
    });
  });

  describe("getRelease", () => {
    it("normalizes Discogs release payload into ReleaseData", async () => {
      discogsMocks.getRelease.mockImplementation((releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback(null, {
          id: releaseId,
          title: "Die Bestie In Menschengestalt",
          artists: [{ name: "Die Ärzte" }],
          images: [{ uri: "https://img.discogs.com/bestie-cover.jpg" }],
          uri: "https://www.discogs.com/release/524045-Die-Ärzte-Die-Bestie-In-Menschengestalt",
          year: 1993,
          identifiers: [{ type: "Barcode", value: "7 3145210171 6" }],
          tracklist: [
            { type_: "track", position: "A1", title: "Inntro", duration: "0:05" },
            { type_: "track", position: "A2", title: "Schrei Nach Liebe", duration: "4:12" },
            { type_: "track", position: "A3", title: "Schopenhauer", duration: "3:06" },
            { type_: "track", position: "A4", title: "Für Uns", duration: "4:42" },
            { type_: "track", position: "A5", title: "Hey Huh (In Scheiben)", duration: "1:29" },
            { type_: "track", position: "A6", title: "FaFaFa", duration: "1:41" },
          ],
        });
      });

      const result = await Discogs.getRelease(524_045);

      expect(result).toEqual({
        id: 524_045,
        artist: "Die Ärzte",
        title: "Die Bestie In Menschengestalt",
        image: "https://img.discogs.com/bestie-cover.jpg",
        url: "https://www.discogs.com/release/524045-Die-Ärzte-Die-Bestie-In-Menschengestalt",
        year: "1993",
        tracks: [
          { title: "Inntro", trackNumber: 1, duration: 5 },
          { title: "Schrei Nach Liebe", trackNumber: 2, duration: 252 },
          { title: "Schopenhauer", trackNumber: 3, duration: 186 },
          { title: "Für Uns", trackNumber: 4, duration: 282 },
          { title: "Hey Huh (In Scheiben)", trackNumber: 5, duration: 89 },
          { title: "FaFaFa", trackNumber: 6, duration: 101 },
        ],
        barcode: "731452101716",
      });
    });

    it("falls back to master release when release endpoint returns 404", async () => {
      discogsMocks.getRelease.mockImplementation((_releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback({ statusCode: 404, message: "Not Found" });
      });
      discogsMocks.getMaster.mockImplementation((_releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback(null, {
          title: "Die Bestie In Menschengestalt",
          artists: [{ name: "Die Ärzte" }],
          uri: "https://www.discogs.com/release/524045-Die-Ärzte-Die-Bestie-In-Menschengestalt",
          year: 1993,
          tracklist: [
            { type_: "track", position: "A1", title: "Inntro", duration: "0:05" },
            { type_: "track", position: "A2", title: "Schrei Nach Liebe", duration: "4:12" },
          ],
        });
      });

      const result = await Discogs.getRelease(524_045);

      expect(result.title).toBe("Die Bestie In Menschengestalt");
      expect(result.tracks).toEqual([
        { title: "Inntro", trackNumber: 1, duration: 5 },
        { title: "Schrei Nach Liebe", trackNumber: 2, duration: 252 },
      ]);
      expect(discogsMocks.getMaster).toHaveBeenCalledWith(524_045, expect.any(Function));
    });

    it("rejects when Discogs returns non-404 error", async () => {
      discogsMocks.getRelease.mockImplementation((_releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback(new Error("Discogs unavailable"));
      });

      await expect(Discogs.getRelease(1)).rejects.toThrow("Discogs unavailable");
      expect(discogsMocks.getMaster).not.toHaveBeenCalled();
    });

    it("rejects when both release and master return no data", async () => {
      discogsMocks.getRelease.mockImplementation((_releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback({ statusCode: 404, message: "Not Found" });
      });
      discogsMocks.getMaster.mockImplementation((_releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback(null, undefined);
      });

      await expect(Discogs.getRelease(1)).rejects.toThrow("No data returned from Discogs");
    });

    it("converts timecode with hours to seconds", async () => {
      discogsMocks.getRelease.mockImplementation((releaseId: number, callback: (error: unknown, data?: unknown) => void) => {
        callback(null, {
          id: releaseId,
          title: "Long Album",
          artists: [{ name: "Some Artist" }],
          images: [],
          uri: "https://www.discogs.com/release/1",
          year: 2000,
          identifiers: [],
          tracklist: [{ type_: "track", position: "1", title: "Epic Track", duration: "1:02:34" }],
        });
      });

      const result = await Discogs.getRelease(1);

      expect(result.tracks).toEqual([{ title: "Epic Track", trackNumber: 1, duration: 3754 }]);
    });
  });
});
