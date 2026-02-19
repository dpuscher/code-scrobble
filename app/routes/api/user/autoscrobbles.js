const Router = require('express').Router();
const sortBy = require('lodash/sortBy');
const Release = require('../../../models/release');
const User = require('../../../models/user');

Router.get('/', async (req, res) => {
  try {
    const { user } = req;
    const releases = await Release.find({ _id: { $in: user.instantScrobbles } });

    const data = releases.map(release => ({
      // eslint-disable-next-line no-underscore-dangle
      id: release._id,
      artist: release.artist,
      title: release.title,
      year: release.year,
    }));
    return res.send(sortBy(data, ['artist', 'title']));
  } catch (err) {
    return res.status(400).send({ err });
  }
});

Router.delete('/', async (req, res) => {
  try {
    const { body: { id }, user } = req;

    // eslint-disable-next-line no-underscore-dangle
    await User.updateOne({ _id: user._id }, { $pullAll: { instantScrobbles: [id] } });

    return res.send();
  } catch (error) {
    return res.status(400).send({ error });
  }
});

module.exports = Router;
