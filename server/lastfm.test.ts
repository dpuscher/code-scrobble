const lastfmMocks = vi.hoisted(() => {
  const scrobble = vi.fn();
  const getInfo = vi.fn();
  const setSessionCredentials = vi.fn();

  const LastFMApi = vi.fn().mockImplementation(function MockLastFMApi() {
    return {
      setSessionCredentials,
      track: {
        scrobble,
      },
      user: {
        getInfo,
      },
    };
  });

  return {
    scrobble,
    getInfo,
    setSessionCredentials,
    LastFMApi,
  };
});

vi.mock("lastfmapi", () => ({
  default: lastfmMocks.LastFMApi,
}));

import * as LastFM from "./lastfm";

describe("server/lastfm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("scrobbleTracks", () => {
    it("builds timestamped scrobble payload and resolves Last.fm response", async () => {
      vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

      const apiResponse: {
        scrobbles: {
          "@attr": { accepted: string; ignored: string };
          scrobble: Array<{ track: { "#text": string }; album: { "#text": string }; timestamp: string }>;
        };
      } = {
        scrobbles: {
          "@attr": { accepted: "2", ignored: "0" },
          scrobble: [
            {
              track: { "#text": "Inntro" },
              album: { "#text": "Die Bestie In Menschengestalt" },
              timestamp: "1700000000",
            },
            {
              track: { "#text": "Schrei Nach Liebe" },
              album: { "#text": "Die Bestie In Menschengestalt" },
              timestamp: "1700000005",
            },
          ],
        },
      };

      lastfmMocks.scrobble.mockImplementation(
        (
          _payload: unknown,
          callback: (error: Error | null, data?: typeof apiResponse) => void,
        ) => {
          callback(null, apiResponse);
        },
      );

      const result = await LastFM.scrobbleTracks("robot", "session-key", {
        title: "Die Bestie In Menschengestalt",
        artist: "Die Ärzte",
        tracks: [
          { title: "Inntro", trackNumber: 1, duration: 5 },
          { title: "Schrei Nach Liebe", trackNumber: 2, duration: 252 },
        ],
      });

      expect(lastfmMocks.scrobble.mock.calls[0][0]).toEqual([
        {
          album: "Die Bestie In Menschengestalt",
          artist: "Die Ärzte",
          timestamp: 1_699_999_743,
          track: "Inntro",
          trackNumber: 1,
        },
        {
          album: "Die Bestie In Menschengestalt",
          artist: "Die Ärzte",
          timestamp: 1_699_999_748,
          track: "Schrei Nach Liebe",
          trackNumber: 2,
        },
      ]);
      expect(result).toEqual(apiResponse);
      expect(lastfmMocks.setSessionCredentials).toHaveBeenCalledWith("robot", "session-key");
      expect(lastfmMocks.scrobble).toHaveBeenCalledTimes(1);
    });

    it("rejects when Last.fm scrobble returns an error", async () => {
      lastfmMocks.scrobble.mockImplementation(
        (_payload: unknown, callback: (error: Error | null, data?: unknown) => void) => {
          callback(new Error("Rate limit exceeded"));
        },
      );

      await expect(
        LastFM.scrobbleTracks("robot", "session-key", {
          title: "Die Bestie In Menschengestalt",
          artist: "Die Ärzte",
          tracks: [{ title: "Für Uns", trackNumber: 1, duration: 282 }],
        }),
      ).rejects.toThrow("Rate limit exceeded");
    });

    it("rejects when Last.fm scrobble response is missing", async () => {
      lastfmMocks.scrobble.mockImplementation(
        (_payload: unknown, callback: (error: Error | null, data?: unknown) => void) => {
          callback(null);
        },
      );

      await expect(
        LastFM.scrobbleTracks("robot", "session-key", {
          title: "Die Bestie In Menschengestalt",
          artist: "Die Ärzte",
          tracks: [{ title: "Schopenhauer", trackNumber: 1, duration: 186 }],
        }),
      ).rejects.toThrow("No scrobble response returned from Last.fm");
    });
  });

  describe("getUserData", () => {
    it("returns user profile from Last.fm", async () => {
      const userProfile: LastFM.LastFMUserData = {
        name: "robot",
        realname: "Robot Daft",
        url: "https://www.last.fm/user/robot",
        country: "DE",
        image: [{ "#text": "https://lastfm.freetls.fastly.net/i/u/avatar170s/sample.jpg", size: "large" }],
      };

      lastfmMocks.getInfo.mockImplementation(
        (_user: unknown, callback: (error: Error | null, data?: LastFM.LastFMUserData) => void) => {
          callback(null, userProfile);
        },
      );

      const result = await LastFM.getUserData("robot", "session-key");

      expect(result).toEqual(userProfile);
      expect(lastfmMocks.setSessionCredentials).toHaveBeenCalledWith("robot", "session-key");
      expect(lastfmMocks.getInfo).toHaveBeenCalledWith(null, expect.any(Function));
    });

    it("rejects when Last.fm getInfo returns an error", async () => {
      lastfmMocks.getInfo.mockImplementation(
        (_user: unknown, callback: (error: Error | null, data?: LastFM.LastFMUserData) => void) => {
          callback(new Error("Invalid session key"));
        },
      );

      await expect(LastFM.getUserData("robot", "bad-session-key")).rejects.toThrow("Invalid session key");
    });

    it("rejects when Last.fm user data is missing", async () => {
      lastfmMocks.getInfo.mockImplementation(
        (_user: unknown, callback: (error: Error | null, data?: LastFM.LastFMUserData) => void) => {
          callback(null);
        },
      );

      await expect(LastFM.getUserData("robot", "session-key")).rejects.toThrow("No user data returned from Last.fm");
    });
  });
});
