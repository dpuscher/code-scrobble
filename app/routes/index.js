/* eslint-disable global-require */

module.exports = function routes(server, app) {
  server.use('/api', require('./api'));
  server.use('/auth', require('./auth'));
  server.get('/logout', require('./logout'));
  server.use('/', require('./pages')(app));
};
