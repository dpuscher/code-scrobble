const Discogs = require('disconnect').Client;
const dig = require('object-dig');
const orderBy = require('lodash/orderBy');
const pick = require('lodash/pick');
const find = require('lodash/find');
const Cache = require('./cache');

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

const normalizeTracklist = (tracks) => {
  const vinylPositionRegex = /^[A-Z]-?[0-9]+$/;
  let tracklist = tracks
    // eslint-disable-next-line no-underscore-dangle
    .filter(track => track.type_ === 'track')
    .filter(track => !/video/i.test(track.position));

  // Remove Bonus CDs from vinyl releases:
  if (tracklist.length && vinylPositionRegex.test(tracklist[0].position)) {
    const filteredTracks = tracklist.filter(track => vinylPositionRegex.test(track.position));
    if (filteredTracks.length !== tracklist.length) {
      tracklist = filteredTracks;
    }
  }

  return tracklist;
};

const getBarcode = (data = []) => (
  (find(data, { type: 'Barcode' }) || {}).value
);

module.exports = {
  barcode: barcode => (
    new Promise((resolve) => {
      const cacheKey = `barcode--${barcode}`;

      Cache.get(cacheKey)
        .then((results) => {
          resolve(results);
        })
        .catch(() => {
          Database.search(undefined, { barcode, type: 'release' }, (err, data) => {
            if (err || !data || !data.results || !data.results.length) {
              return resolve();
            }
            const results = orderBy(
              data.results,
              ['community.have', 'community.want'],
              ['desc', 'desc'],
            );

            Cache.set(cacheKey, results);

            return resolve(results[0].id);
          });
        });
    })
  ),

  search: query => (
    new Promise((resolve) => {
      const cacheKey = `search--${query}`;

      Cache.get(cacheKey)
        .then((results) => {
          resolve(results);
        })
        .catch(() => {
          // eslint-disable-next-line consistent-return
          Database.search(query, { type: 'release' }, (err, data) => {
            if (err || !data || !data.results || !data.results.length) {
              return resolve();
            }

            const results = data.results.map(result => (
              pick(result, ['id', 'title', 'thumb', 'country', 'year', 'format', 'uri'])
            ));

            Cache.set(cacheKey, results);

            resolve(results);
          });
        });
    })
  ),

  getRelease: id => (
    new Promise((resolve, reject) => {
      Database.getRelease(id, (err, data) => {
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
            tracks: normalizeTracklist(data.tracklist)
              .map((track, index) => ({
                title: track.title,
                trackNumber: index + 1,
                duration: convertTimecode(track.duration),
              })),
            barcode: getBarcode(data.identifiers),
          });
        }
      });
    })
  ),
};
