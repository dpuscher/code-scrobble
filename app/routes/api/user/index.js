const Router = require('express').Router();

Router.get('/autoscrobbles', require('./autoscrobbles'));

module.exports = Router;
