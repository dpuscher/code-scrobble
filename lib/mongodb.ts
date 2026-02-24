import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
  isConnected = true;
}
