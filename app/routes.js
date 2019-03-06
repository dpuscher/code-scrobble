/* eslint-disable no-param-reassign */
const path = require('path');
const Discogs = require('./discogs');
const LastFM = require('./lastfm');
const Release = require('./models/release');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/login');
}

function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  return res.redirect('/');
}

module.exports = function routes(server, app, passport) {
  server.get('/auth/lastfm', passport.authenticate('lastfm'));

  server.get(
    '/auth/lastfm/callback',
    passport.authenticate('lastfm', {
      successRedirect: '/',
      failureRedirect: '/login',
    }),
  );

  server.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  server.get('/search/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!req.isAuthenticated()) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

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
  });

  server.get('/session', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.send(JSON.stringify(req.user.toJSON() || {}));
  });

  server.post('/scrobble', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (!req.isAuthenticated()) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    try {
      const { body: { id: releaseId, autoScrobble }, user } = req;

      Release.findOne({ _id: releaseId }, async (err, release) => {
        if (err || !release) {
          return res.status(400).send(JSON.stringify({ error: 'Release not found' }));
        }

        if (autoScrobble) {
          user.instantScrobbles.addToSet(release.id);
          await user.save();
        }

        const response = await LastFM.scrobbleTracks(req.user.name, req.user.key, release);

        return res.send(JSON.stringify(response));
      });
    } catch (error) {
      return res.status(400).send({ error });
    }
  });

  server.get('/detected/:barcode', isLoggedIn, (req, res) => {
    app.render(req, res, '/detected', { barcode: req.params.barcode });
  });

  server.get('/scrobbled/:barcode', isLoggedIn, (req, res) => {
    app.render(req, res, '/scrobbled', { barcode: req.params.barcode });
  });

  server.get('/login', isNotLoggedIn, (req, res) => {
    app.render(req, res, '/login');
  });

  server.get('/legal', (req, res) => {
    app.render(req, res, '/legal');
  });

  server.get('/privacy', (req, res) => {
    app.render(req, res, '/privacy');
  });

  server.get('/service-worker.js', (req, res) => {
    app.serveStatic(req, res, path.resolve('./static/service-worker.js'));
  });

  server.get('/', isLoggedIn, (req, res) => {
    app.render(req, res, '/');
  });
};
