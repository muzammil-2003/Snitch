import mongoose from "mongoose";
import { config } from "./config.js";

export const connectToDatabase = async () => {
    await mongoose.connect(config.MONGODB_URI)
    console.log("MongoDB connected.")
}