const find = require('lodash/find');

const LastFMStrategy = require('passport-lastfm');
const User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function passortConfig(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(
    new LastFMStrategy(
      {
        api_key: process.env.LASTFM_KEY,
        secret: process.env.LASTFM_SECRET,
        callbackURL: `${process.env.SERVER_URL}/auth/lastfm/callback`,
      },

      ((req, sessionKey, done) => {
        // eslint-disable-next-line consistent-return
        User.findOne({ 'lastfm.id': req.user.id }, (userErr, user) => {
          if (userErr) return done(userErr);

          const creds = find(req.user.tokens, { type: 'lastfm' });
          if (user.lastfm && creds) {
            return done(null, user);
          }

          const newUser = new User();
          newUser.lastfm.id = req.user.id;
          newUser.lastfm.username = sessionKey.username;
          newUser.lastfm.key = sessionKey.key;

          newUser.save((saveErr) => {
            if (saveErr) throw saveErr;
            return done(null, newUser);
          });
        });
      }),
    ),
  );
};
