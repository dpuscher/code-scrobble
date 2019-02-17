const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

module.exports = function expressConfig(express, app, passport, dev = false) {
  if (dev) app.use(morgan('dev'));
  app.use(cookieParser());

  app.use(session({
    store: new RedisStore({ url: process.env.REDISCLOUD_URL }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
};
