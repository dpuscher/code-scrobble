// eslint-disable-next-line @typescript-eslint/no-require-imports
const LastFMApi = require("lastfmapi");

interface ScrobbleTrack {
  album: string;
  artist: string;
  timestamp: number;
  track: string;
  trackNumber: number;
}

interface ReleaseForScrobble {
  title: string;
  artist: string;
  tracks: Array<{ title: string; trackNumber: number; duration: number }>;
}

const createApiClient = (username: string, key: string) => {
  const lfm = new LastFMApi({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET,
  });
  lfm.setSessionCredentials(username, key);
  return lfm;
};

const getScrobble = (data: ReleaseForScrobble): ScrobbleTrack[] => {
  let nextTimestamp = Math.floor(Date.now() / 1000);
  const trackData: ScrobbleTrack[] = [];

  data.tracks.forEach(track => {
    trackData.push({
      album: data.title,
      artist: data.artist,
      timestamp: nextTimestamp,
      track: track.title,
      trackNumber: track.trackNumber,
    });
    nextTimestamp += track.duration;
  });

  return trackData;
};

export const scrobbleTracks = (username: string, key: string, data: ReleaseForScrobble): Promise<unknown> =>
  new Promise((resolve, reject) => {
    createApiClient(username, key).track.scrobble(getScrobble(data), (err: unknown, scrobbles: unknown) => {
      if (err) reject(err);
      resolve(scrobbles);
    });
  });

export interface LastFMUserData {
  url: string;
  image?: Array<{ "#text": string }>;
}

export const getUserData = (username: string, key: string): Promise<LastFMUserData> =>
  new Promise((resolve, reject) => {
    createApiClient(username, key).user.getInfo(null, (err: unknown, userData: unknown) => {
      if (err) reject(err);
      resolve(userData as LastFMUserData);
    });
  });
