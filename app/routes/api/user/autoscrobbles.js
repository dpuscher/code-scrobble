module.exports = function userAutoscrobbles(req, res) {
  const { user } = req;
  return res.send(JSON.stringify(user.instantScrobbles));
};
