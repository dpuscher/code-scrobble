function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/');
}

function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  return res.redirect('/');
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

  server.get('/scan', isLoggedIn, (req, res) => {
    app.render(req, res, '/scan', { user: req.user });
  });

  server.get('/login', isNotLoggedIn, (req, res) => {
    app.render(req, res, '/login');
  });
};
