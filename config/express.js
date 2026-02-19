const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const session = require('express-session');
const { createClient } = require('redis');
const helmet = require('helmet');
const { RedisStore } = require('connect-redis');

module.exports = function expressConfig(app, passport, dev = false) {
  if (dev) app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(compression());
  app.use(helmet());

  const redisClient = createClient({ url: process.env.REDISCLOUD_URL });
  redisClient.connect().catch(console.error);
  redisClient.on('error', console.error);

  app.use(session({
    store: new RedisStore({ client: redisClient }),
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
};
