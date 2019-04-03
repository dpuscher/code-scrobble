const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  key: String,
  url: String,
  image: String,
  imageLarge: String,
  imageXLarge: String,
  instantScrobbles: [String],
  history: [{
    id: String,
    time: { type: Date, default: Date.now },
  }],
});

userSchema.methods.toJSON = function toJSON() {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: this._id,
    name: this.name,
    url: this.url,
    image: this.image,
    imageLarge: this.imageLarge,
    imageXLarge: this.imageXLarge,
  };
};

userSchema.methods.isInstantScrobble = function isInstantScrobble(id) {
  return (this.instantScrobbles || []).includes(String(id));
};

module.exports = mongoose.model('User', userSchema);
