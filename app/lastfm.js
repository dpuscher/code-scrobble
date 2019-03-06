const LastFM = require('lastfmapi');

const LastFmApi = (username, key) => {
  const lfm = new LastFM({
    api_key: process.env.LASTFM_KEY,
    secret: process.env.LASTFM_SECRET,
  });
  lfm.setSessionCredentials(username, key);
  return lfm;
};

const getScrobble = (data) => {
  let nextTimestamp = Math.floor(Date.now() / 1000);
  const trackData = [];

  data.tracks.forEach((track) => {
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

module.exports = {
  scrobbleTracks: (username, key, data) => (
    new Promise((resolve, reject) => {
      LastFmApi(username, key).track.scrobble(
        getScrobble(data),
        (err, scrobbles) => {
          if (err) reject(err);
          resolve(scrobbles);
        },
      );
    })
  ),

  getUserData: (username, key) => (
    new Promise((resolve, reject) => {
      LastFmApi(username, key).user.getInfo(
        null,
        (err, userData) => {
          if (err) reject(err);
          resolve(userData);
        },
      );
    })
  ),
};
