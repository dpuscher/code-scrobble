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

      ((req, userData, done) => {
        // eslint-disable-next-line consistent-return
        User.findOne({ name: userData.name }, (userErr, user) => {
          if (userErr) return done(userErr);

          let currentUser = user;
          if (!currentUser) currentUser = new User();

          currentUser.name = userData.name;
          currentUser.key = userData.key;

          currentUser.save((saveErr) => {
            if (saveErr) throw saveErr;
            return done(null, currentUser);
          });
        });
      }),
    ),
  );
};
