const Discogs = require('disconnect').Client;
const dig = require('object-dig');
const orderBy = require('lodash/orderBy');

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
      Database.search(undefined, { barcode, type: 'release' }, (err, data) => {
        if (err || !data || !data.results || !data.results.length) {
          return resolve();
        }
        const results = orderBy(
          data.results,
          ['community.have', 'community.want'],
          ['desc', 'desc'],
        );
        return resolve(results[0].master_id);
      });
    })
  ),

  getMaster: id => (
    new Promise((resolve, reject) => {
      Database.getMaster(id, (err, data) => {
        if (err || !data) {
          reject();
        } else {
          resolve({
            id,
            artist: data.artists.map(a => a.name).join(', '),
            title: data.title,
            image: dig(data, 'images', 0, 'uri'),
            url: data.uri,
            year: data.year,
            tracks: data
              .tracklist
              .filter(track => track.type_ === 'track') // eslint-disable-line no-underscore-dangle
              .filter(track => !/video/i.test(track.position))
              .map((track, index) => ({
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
