const Router = require('express').Router();

Router.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});
Router.use(require('../../middlewares/loggedInApi'));

Router.get('/session', require('./session'));
Router.get('/barcode/:id', require('./barcode'));
Router.get('/search/:query', require('./search'));
Router.post('/scrobble', require('./scrobble'));
Router.use('/user', require('./user'));

Router.use((req, res) => {
  res.status(404).send('404 Not Found\n\n(╯°□°)╯︵ ┻━┻');
});

module.exports = Router;
