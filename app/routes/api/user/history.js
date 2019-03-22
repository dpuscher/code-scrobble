const find = require('lodash/find');
const sortBy = require('lodash/sortBy');
const compact = require('lodash/compact');
const Release = require('../../../models/release');

module.exports = function userHistory(req, res) {
  const { user: { history } } = req;
  Release.find({ _id: { $in: history.map(h => h.id) } }, (err, releases = []) => {
    if (err) {
      return res.status(400).send({ err });
    }

    const data = history.map((item) => {
      // eslint-disable-next-line no-underscore-dangle
      const release = find(releases, r => String(r._id) === item.id);
      if (!release) return undefined;
      return ({
        // eslint-disable-next-line no-underscore-dangle
        id: item._id,
        time: item.time,
        artist: release.artist,
        title: release.title,
        year: release.year,
        barcode: release.barcode,
      });
    });

    return res.send(sortBy(compact(data), ['time']).reverse());
  });
};
