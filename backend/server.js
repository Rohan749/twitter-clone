import express from "express";
import authRoutes from "./routes/auth.routes.js"
import mongoose from "mongoose";
import dotenv from "dotenv"
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use("/auth", authRoutes)


app.listen(PORT, (req, res, next) => {
    console.log(`Server is running on port: ${PORT}`)
    connectMongoDB()
})