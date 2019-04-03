const Discogs = require('../../discogs');

module.exports = async function apiSearch(req, res) {
  try {
    const results = await Discogs.search(req.params.query);
    return res.send(JSON.stringify(results));
  } catch (error) {
    return res.status(400).send({ error });
  }
};
