const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  key: String,
});

module.exports = mongoose.model('User', userSchema);
