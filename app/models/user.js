const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  lastfm: {
    username: String,
    key: String,
  },
});

module.exports = mongoose.model('User', userSchema);
