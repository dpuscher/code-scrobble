// route middleware to make sure
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) { return next(); }

  // if they aren't redirect them to the home page
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

  // // =====================================
  // // LOGIN ===============================
  // // =====================================
  // // show the login form

  // // =====================================
  // // PROFILE SECTION =========================
  // // =====================================
  // // we will want this protected so you have to be logged in to visit
  // // we will use route middleware to verify this (the isLoggedIn function)
  // app.get('/scan', isLoggedIn, (req, res) => {
  //   res.render('profile.ejs', {
  //     user: req.user, // get the user out of session and pass to template
  //   });
  // });

  // // =====================================
  // // FACEBOOK ROUTES =====================
  // // =====================================
  // // route for facebook authentication and login
  // app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

  // // handle the callback after facebook has authenticated the user
  // app.get('/auth/facebook/callback',
  //   passport.authenticate('facebook', {
  //     successRedirect: '/profile',
  //     failureRedirect: '/',
  //   }));

  // // =====================================
  // // LOGOUT ==============================
  // // =====================================
  // app.get('/logout', (req, res) => {
  //   req.logout();
  //   res.redirect('/');
  // });
};
