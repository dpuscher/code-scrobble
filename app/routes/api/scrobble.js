const Release = require('../../models/release');
const LastFM = require('../../lastfm');

// eslint-disable-next-line consistent-return
module.exports = function scrobble(req, res) {
  try {
    const { body: { id: releaseId, autoScrobble }, user } = req;

    Release.findOne({ _id: releaseId }, async (err, release) => {
      if (err || !release) {
        return res.status(400).send(JSON.stringify({ error: 'Release not found' }));
      }

      user.history = [{ id: releaseId }].concat(user.history.slice(0, 19));
      if (autoScrobble) user.instantScrobbles.addToSet(releaseId);
      await user.save();

      const response = await LastFM.scrobbleTracks(req.user.name, req.user.key, release);

      return res.send(JSON.stringify(response));
    });
  } catch (error) {
    return res.status(400).send({ error });
  }
};
