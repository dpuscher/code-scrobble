import mongoose, { Schema, HydratedDocument, Model } from "mongoose";

interface IHistoryItem {
  id: string;
  time: Date;
}

export interface IUser {
  name: string;
  key: string;
  url: string;
  image: string;
  imageLarge: string;
  imageXLarge: string;
  instantScrobbles: string[];
  history: IHistoryItem[];
}

export interface UserJSON {
  id: string;
  name: string;
  url: string;
  image: string;
  imageLarge: string;
  imageXLarge: string;
}

interface IUserMethods {
  toJSON(): UserJSON;
  isInstantScrobble(id: string): boolean;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: String,
  key: String,
  url: String,
  image: String,
  imageLarge: String,
  imageXLarge: String,
  instantScrobbles: [String],
  history: [
    {
      id: String,
      time: { type: Date, default: Date.now },
    },
  ],
});

userSchema.methods.toJSON = function toJSON(): UserJSON {
  return {
    id: String(this._id),
    name: this.name,
    url: this.url,
    image: this.image,
    imageLarge: this.imageLarge,
    imageXLarge: this.imageXLarge,
  };
};

userSchema.methods.isInstantScrobble = function isInstantScrobble(id: string) {
  return (this.instantScrobbles || []).includes(String(id));
};

const User =
  (mongoose.models.User as UserModel & { new (): HydratedDocument<IUser, IUserMethods> }) ||
  mongoose.model<IUser, UserModel>("User", userSchema);

export default User;
