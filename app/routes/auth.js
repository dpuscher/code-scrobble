const passport = require('passport');
const Router = require('express').Router();

Router.get('/lastfm', function (req, res, next) {
  passport.authenticate('lastfm', {
    callbackURL: `${req.protocol}://${req.headers.host}/auth/lastfm/callback`,
  })(req, res, next)
})

Router.get(
  '/lastfm/callback',
  passport.authenticate('lastfm', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
);

module.exports = Router;
