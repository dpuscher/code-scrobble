const Release = require('../../models/release');

// eslint-disable-next-line consistent-return
module.exports = async function apiBarcode(req, res) {
  try {
    const [barcode, id] = req.params.id.split('id:');

    const query = id ? { id } : { barcode };
    const release = await Release.firstOrCreate(query);
    if (!release) return res.send('{}');

    // eslint-disable-next-line no-underscore-dangle
    const instantScrobble = req.user.isInstantScrobble(release._id);
    return res.send(JSON.stringify(Object.assign(
      { instantScrobble },
      release.toJSON(),
    )));
  } catch (error) {
    return res.status(400).send({ error });
  }
};
