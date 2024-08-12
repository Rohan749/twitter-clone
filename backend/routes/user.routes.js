import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { UpdateUserProfile, followUnfollowUser, getUserProfile, suggestedProfile } from "../controllers/user.controller.js";


const router = express.Router()

router.get("/profile/:username", protectedRoute, getUserProfile)
router.get("/suggested", protectedRoute, suggestedProfile)
router.post("/follow/:id", protectedRoute, followUnfollowUser)
router.post("/update", protectedRoute, UpdateUserProfile)

export default router
