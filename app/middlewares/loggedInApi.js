module.exports = function loggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  return next();
};
