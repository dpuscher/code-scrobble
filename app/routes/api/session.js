module.exports = function apiSession(req, res) {
  return res.send(JSON.stringify(req.user.toJSON()));
};
