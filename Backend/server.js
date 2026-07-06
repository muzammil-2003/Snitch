import dotenv from 'dotenv'
import app from './src/app.js'
import { connectToDatabase } from './src/config/database.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const startServer = async () => {
    try {
        await connectToDatabase()
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        throw new Error("Failed to start server")
    }
}

startServer()