const LastFMStrategy = require('passport-lastfm');

const LastFM = require('../app/lastfm');
const User = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function passportConfig(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new LastFMStrategy(
      {
        api_key: process.env.LASTFM_KEY,
        secret: process.env.LASTFM_SECRET,
      },

      (async (req, { name, key }, done) => {
        try {
          let currentUser = await User.findOne({ name });
          if (!currentUser) currentUser = new User();

          currentUser.name = name;
          currentUser.key = key;

          const userData = await LastFM.getUserData(name, key);
          currentUser.url = userData.url;
          currentUser.image = userData?.image?.[1]?.['#text'];
          currentUser.imageLarge = userData?.image?.[2]?.['#text'];
          currentUser.imageXLarge = userData?.image?.[3]?.['#text'];

          await currentUser.save();
          return done(null, currentUser);
        } catch (err) {
          return done(err);
        }
      }),
    ),
  );
};
