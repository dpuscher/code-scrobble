import mongoose, { Schema, HydratedDocument, Model } from "mongoose";
import pick from "lodash/pick";
import * as Discogs from "../discogs";

interface ITrack {
  title: string;
  trackNumber: number;
  duration: number;
}

export interface IRelease {
  id: number;
  artist: string;
  title: string;
  image: string | undefined;
  url: string;
  year: string;
  tracks: ITrack[];
  barcode: string | undefined;
  updatedAt: Date;
}

interface IReleaseMethods {
  toJSON(): object;
  updateFromDiscogs(): Promise<boolean>;
}

interface IReleaseModel extends Model<IRelease, object, IReleaseMethods> {
  createFromDiscogs(id: number, barcode?: string): Promise<HydratedDocument<IRelease, IReleaseMethods>>;
  firstOrCreate(param: {
    id?: string | number;
    barcode?: string;
  }): Promise<HydratedDocument<IRelease, IReleaseMethods> | null>;
}

const releaseSchema = new Schema<IRelease, IReleaseModel, IReleaseMethods>(
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
    tracks: [
      {
        title: String,
        trackNumber: Number,
        duration: Number,
      },
    ],
    barcode: String,
  },
  { timestamps: true },
);

releaseSchema.methods.toJSON = function toJSON() {
  return {
    id: this._id,
    artist: this.artist,
    title: this.title,
    image: this.image,
    url: this.url,
    year: this.year,
    tracks: this.tracks.map((track: ITrack) => pick(track, ["title", "trackNumber", "duration"])),
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
  if (!this.barcode && data.barcode) this.barcode = data.barcode;
  await this.save();

  return true;
};

releaseSchema.statics.createFromDiscogs = async function createFromDiscogs(id: number, barcodeValue?: string) {
  const release = new this({ id });
  if (barcodeValue) release.barcode = barcodeValue;
  await release.updateFromDiscogs();
  return release;
};

releaseSchema.statics.firstOrCreate = async function firstOrCreate(param: { id?: string | number; barcode?: string }) {
  const query: { id?: number; barcode?: string } = {};
  if (param.id) query.id = Number(param.id);
  if (param.barcode) query.barcode = param.barcode;
  const release = await this.findOne(query).exec();
  if (!release) {
    const paramId = param.id ? Number(param.id) : undefined;
    const id = paramId || (param.barcode ? await Discogs.barcode(param.barcode) : undefined);
    if (!id) return null;

    try {
      return await this.createFromDiscogs(id, param.barcode);
    } catch (err: any) {
      if (err.code === 11000) {
        return this.findOne({ id }).exec();
      }
      throw err;
    }
  }

  // Data is older than one week
  if (new Date().getTime() - release.updatedAt.getTime() > 604800000) {
    await release.updateFromDiscogs();
  }

  return release;
};

const Release =
  (mongoose.models.Release as IReleaseModel) || mongoose.model<IRelease, IReleaseModel>("Release", releaseSchema);

export default Release;
