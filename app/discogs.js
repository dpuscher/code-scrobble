const Discogs = require('disconnect').Client;
const dig = require('object-dig');

const Database = new Discogs({
  consumerKey: process.env.DISCOGS_KEY,
  consumerSecret: process.env.DISCOGS_SECRET,
}).database();

const convertTimecode = timecode => (
  timecode
    .split(':')
    .map(n => (parseInt(n, 10) || 0))
    .reverse().map((n, i) => (
      n * (60 ** i)
    ))
    .reduce((pv, cv) => pv + cv)
);

module.exports = {
  search: barcode => (
    new Promise((resolve) => {
      Database.search(undefined, { barcode }, (err, data) => {
        if (err || !data || !data.results || !data.results.length) {
          return resolve();
        }
        return resolve(data.results[0].id);
      });
    })
  ),

  getRelease: id => (
    new Promise((resolve) => {
      Database.getRelease(id, (err, data) => {
        if (err || !data) {
          resolve();
        } else {
          resolve({
            id,
            artist: dig(data, 'artists_sort'),
            title: data.title,
            image: dig(data, 'images', 0, 'uri'),
            tracks: data.tracklist.map((track, index) => ({
              title: track.title,
              trackNumber: index + 1,
              duration: convertTimecode(track.duration),
            })),
          });
        }
      });
    })
  ),
};
