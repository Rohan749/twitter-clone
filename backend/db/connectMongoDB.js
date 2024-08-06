import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const connectMongoDB = async () => {
    try {

        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
        
    } catch (error) {
        console.log("Error connection to mongodb:", error.message)
        process.exit(1)
    }
}

export default connectMongoDB;