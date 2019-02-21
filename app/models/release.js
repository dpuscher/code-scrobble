const mongoose = require('mongoose');
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

releaseSchema.methods.updateFromDiscogs = async function updateFromDiscogs() {
  const data = await Discogs.getRelease(this.id);

  if (!data) return false;

  this.artist = data.artist;
  this.title = data.title;
  this.image = data.image;
  this.tracks = data.tracks;
  await this.save();

  return true;
};

module.exports = mongoose.model('Release', releaseSchema);
