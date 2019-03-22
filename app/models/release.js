const mongoose = require('mongoose');
const pick = require('lodash/pick');
const Discogs = require('../discogs');

const releaseSchema = mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
    },
    artist: String,
    title: String,
    image: String,
    url: String,
    year: String,
    tracks: [{
      title: String,
      trackNumber: Number,
      duration: Number,
    }],
    barcode: String,
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
    url: this.url,
    year: this.year,
    tracks: this.tracks.map(track => pick(track, ['title', 'trackNumber', 'duration'])),
  };
};

releaseSchema.methods.updateFromDiscogs = async function updateFromDiscogs() {
  const data = await Discogs.getRelease(this.id);

  if (!data) return false;

  this.artist = data.artist;
  this.title = data.title;
  this.image = data.image;
  this.tracks = data.tracks;
  this.url = data.url;
  this.year = data.year;
  await this.save();

  return true;
};

module.exports = mongoose.model('Release', releaseSchema);
