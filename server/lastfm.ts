import LastFMApi from "lastfmapi";
import { callbackToPromiseRequired } from "../lib/callbackToPromise";

type LastFMScrobbleResponse = LastFMApi.ScrobbleResponse;
type LastFMScrobbleCallback = (error: Error | null, data?: LastFMScrobbleResponse) => void;

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

const generateScrobbleData = (release: ReleaseForScrobble): ScrobbleTrack[] => {
  const totalDuration = release.tracks.reduce((sum, t) => sum + t.duration, 0);
  let nextTimestamp = Math.floor(Date.now() / 1000) - totalDuration;
  const trackData: ScrobbleTrack[] = [];

  for (const track of release.tracks) {
    trackData.push({
      album: release.title,
      artist: release.artist,
      timestamp: nextTimestamp,
      track: track.title,
      trackNumber: track.trackNumber,
    });
    nextTimestamp += track.duration;
  }

  return trackData;
};

export const scrobbleTracks = async (username: string, key: string, data: ReleaseForScrobble): Promise<LastFMScrobbleResponse> => {
  const scrobbleData = generateScrobbleData(data);
  const client = createApiClient(username, key);
  return callbackToPromiseRequired((callback: LastFMScrobbleCallback) => {
    client.track.scrobble(scrobbleData, callback);
  }, "No scrobble response returned from Last.fm");
};

export type LastFMUserData = LastFMApi.UserProfile;

export const getUserData = async (username: string, key: string): Promise<LastFMUserData> => {
  const client = createApiClient(username, key);
  return callbackToPromiseRequired((callback: (error: Error | null, data?: LastFMUserData) => void) => {
    client.user.getInfo(null, callback);
  }, "No user data returned from Last.fm");
};
