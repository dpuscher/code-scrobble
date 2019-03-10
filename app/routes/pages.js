const path = require('path');
const Router = require('express').Router();

const isLoggedIn = require('../middlewares/loggedIn');
const isNotLoggedIn = require('../middlewares/notLoggedIn');

module.exports = function pages(app) {
  Router.get('/detected/:barcode', isLoggedIn, (req, res) => {
    app.render(req, res, '/detected', { barcode: req.params.barcode });
  });

  Router.get('/scrobbled/:barcode', isLoggedIn, (req, res) => {
    app.render(req, res, '/scrobbled', { barcode: req.params.barcode });
  });

  Router.get('/login', isNotLoggedIn, (req, res) => {
    app.render(req, res, '/login');
  });

  Router.get('/legal', (req, res) => {
    app.render(req, res, '/legal');
  });

  Router.get('/privacy', (req, res) => {
    app.render(req, res, '/privacy');
  });

  Router.get('/service-worker.js', (req, res) => {
    app.serveStatic(req, res, path.resolve('./static/service-worker.js'));
  });

  Router.get('/', isLoggedIn, (req, res) => {
    app.render(req, res, '/');
  });

  return Router;
};
