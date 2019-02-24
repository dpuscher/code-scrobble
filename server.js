require('dotenv').config();

const express = require('express');
const next = require('next');
const passport = require('passport');
const mongoose = require('mongoose');

const passportConfig = require('./config/passport');
const expressConfig = require('./config/express');
const routes = require('./app/routes');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Connect to mongo db
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// configure passport instance
passportConfig(passport);

app.prepare().then(() => {
  const server = express();

  expressConfig(server, passport, dev);

  routes(server, app, passport);

  server.get('*', (req, res) => handle(req, res));

  server.listen(port, (err) => {
    if (err) throw err;
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://localhost:${port}`);
  });
});
