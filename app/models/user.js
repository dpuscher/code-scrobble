const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  key: String,
  url: String,
  image: String,
  instantScrobbles: [Number],
});

userSchema.methods.toJSON = function toJSON() {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: this._id,
    name: this.name,
    url: this.url,
    image: this.image,
    instantScrobbles: this.instantScrobbles,
  };
};

module.exports = mongoose.model('User', userSchema);
