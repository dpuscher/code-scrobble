const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const session = require('express-session');
const helmet = require('helmet');
const RedisStore = require('connect-redis')(session);

module.exports = function expressConfig(express, app, passport, dev = false) {
  if (dev) app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(compression());
  app.use(helmet());

  app.use(session({
    store: new RedisStore({ url: process.env.REDISCLOUD_URL }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    rolling: true,
    name: 'sessionId',
    cookie: {
      // domain: "codescrobble.com", TODO: enable for production
      maxAge: 2592000000,
    },
  })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
};
