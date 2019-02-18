/* eslint-disable no-param-reassign */
const Discogs = require('./discogs');
const LastFM = require('./lastfm');
const Release = require('./models/release');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  return res.redirect('/');
}

async function updateModelFromDiscogs(model) {
  const data = await Discogs.getRelease(model.id);
  model.artist = data.artist;
  model.title = data.title;
  model.image = data.image;
  model.tracks = data.tracks;
  model.save();
}

module.exports = function routes(server, app, passport) {
  server.get('/', (req, res) => (
    res.redirect(req.isAuthenticated() ? '/scan' : '/login')
  ));

  server.get('/auth/lastfm', passport.authenticate('lastfm'));

  server.get(
    '/auth/lastfm/callback',
    passport.authenticate('lastfm', {
      successRedirect: '/scan',
      failureRedirect: '/login',
    }),
  );

  server.get('/search/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Unauthorized');
    }

    res.setHeader('Content-Type', 'application/json');

    Release.findOne({ barcode: req.params.id }, async (err, release) => {
      if (err || !release) {
        const id = await Discogs.search(req.params.id);
        if (id) {
          const newRelease = new Release();
          newRelease.barcode = req.params.id;
          newRelease.id = id;
          await updateModelFromDiscogs(newRelease);

          return res.send(JSON.stringify(newRelease.toJSON()));
        }
        return res.send(JSON.stringify({}));
      }

      const instantScrobble = req.user.instantScrobbles.includes(release.id);
      return res.send(JSON.stringify(Object.assign({ instantScrobble }, release.toJSON())));
    });
  });

  server.post('/scrobble', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send('Unauthorized');
    }

    res.setHeader('Content-Type', 'application/json');
    const releaseId = req.body.id;
    const { user } = req;

    Release.findOne({ _id: releaseId }, async (err, release) => {
      try {
        if (err || !release) {
          return res.status(400).send(JSON.stringify({ error: 'Release not found' }));
        }

        user.instantScrobbles.addToSet(release.id);
        user.save();

        const response = await LastFM.scrobbleTracks(req.user.name, req.user.key, release);

        return res.send(JSON.stringify(response));
      } catch (error) {
        return res.status(400).send(JSON.stringify({ error }));
      }
    });
  });

  server.get('/scan', isLoggedIn, (req, res) => {
    app.render(req, res, '/scan', { user: req.user });
  });

  server.get('/login', isNotLoggedIn, (req, res) => {
    app.render(req, res, '/login');
  });
};
