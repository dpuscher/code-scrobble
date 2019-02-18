const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  key: String,
  instantScrobbles: [Number],
});

module.exports = mongoose.model('User', userSchema);
