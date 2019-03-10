const Release = require('../../models/release');
const Discogs = require('../../discogs');

// eslint-disable-next-line consistent-return
module.exports = async function search(req, res) {
  try {
    Release.findOne({ barcode: req.params.id }, async (err, release) => {
      if (err || !release) {
        const id = await Discogs.search(req.params.id);
        if (id) {
          const newRelease = new Release();
          newRelease.barcode = req.params.id;
          newRelease.id = id;
          if (await newRelease.updateFromDiscogs()) {
            return res.send(JSON.stringify(newRelease.toJSON()));
          }
        }
        return res.send(JSON.stringify({}));
      }

      // Data is older than one week
      if (new Date().getTime() - release.updatedAt.getTime() > 604800000) {
        await release.updateFromDiscogs();
      }

      const instantScrobble = req.user.instantScrobbles.includes(release.id);
      return res.send(JSON.stringify(Object.assign({ instantScrobble }, release.toJSON())));
    });
  } catch (error) {
    return res.status(400).send({ error });
  }
};
