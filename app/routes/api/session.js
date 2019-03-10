module.exports = function session(req, res) {
  return res.send(JSON.stringify(req.user.toJSON()));
};
