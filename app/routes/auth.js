const passport = require('passport');
const Router = require('express').Router();

Router.get('/lastfm', passport.authenticate('lastfm'));

Router.get(
  '/lastfm/callback',
  passport.authenticate('lastfm', {
    successRedirect: '/',
    failureRedirect: '/login',
  }),
);

module.exports = Router;
