const Router = require('express').Router();

Router.use('/autoscrobbles', require('./autoscrobbles'));
Router.get('/history', require('./history'));

module.exports = Router;
