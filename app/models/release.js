const mongoose = require('mongoose');
const omit = require('lodash/omit');
const Discogs = require('../discogs');

const releaseSchema = mongoose.Schema(
  {
    id: Number,
    artist: String,
    title: String,
    image: String,
    tracks: [{
      title: String,
      trackNumber: Number,
      duration: Number,
    }],
    barcode: Number,
  },
  { timestamps: true },
);

releaseSchema.methods.toJSON = function toJSON() {
  return {
    // eslint-disable-next-line no-underscore-dangle
    id: this._id,
    artist: this.artist,
    title: this.title,
    image: this.image,
  };
};

module.exports = mongoose.model('Release', releaseSchema);
