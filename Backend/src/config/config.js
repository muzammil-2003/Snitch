import dotenv from 'dotenv'
dotenv.config()

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not found in environment variables.")
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not found in environment variables.")
}

export const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET
}