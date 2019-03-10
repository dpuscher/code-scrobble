module.exports = function logout(req, res) {
  req.logout();
  res.redirect('/');
};
