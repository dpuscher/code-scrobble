module.exports = function isNotLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) { return next(); }
  return res.redirect('/');
};
