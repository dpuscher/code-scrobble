const Router = require('express').Router();
const sortBy = require('lodash/sortBy');
const Release = require('../../../models/release');
const User = require('../../../models/user');

Router.get('/', (req, res) => {
  const { user } = req;

  Release.find({ _id: { $in: user.instantScrobbles } }, (err, releases = []) => {
    if (err) {
      return res.status(400).send({ err });
    }

    const data = releases.map(release => ({
      // eslint-disable-next-line no-underscore-dangle
      id: release._id,
      artist: release.artist,
      title: release.title,
      year: release.year,
    }));
    return res.send(sortBy(data, ['artist', 'title']));
  });
});

Router.delete('/', async (req, res) => {
  try {
    const { body: { id }, user } = req;

    // eslint-disable-next-line no-underscore-dangle
    await User.update({ _id: user._id }, { $pullAll: { instantScrobbles: [id] } });

    return res.send();
  } catch (error) {
    return res.status(400).send({ error });
  }
});

module.exports = Router;
