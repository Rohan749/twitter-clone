import User from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const protectedRoute = async (req, res, next) => {
    try {
        
        const verifyToken = req.cookies.jwt;

        if(!verifyToken) {
            res.status(400).json({error: "Unauthorised! no token provided."})
        }

        const decoded = jwt.verify(verifyToken, process.env.JWT_SECRET)

        if(!decoded) {
            res.status(400).json({error: "Unauthorised! Invalid token"})
        }

        const user = await User.findById(decoded.userId).select("-password")

        if(!user) {
            res.status(400).json({error: "No user found with this token."})
        }

        req.user = user

        next();
    } catch (error) {
        console.log("Error in protected route controller:", error.message)
        res.status(400).json({error: "Internal server error."})
    }
}