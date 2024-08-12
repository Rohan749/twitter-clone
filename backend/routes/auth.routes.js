import express from "express"
import { getMe, loginController, logoutController, signupController } from "../controllers/auth.controller.js"
import { protectedRoute } from "../middleware/protectedRoute.js"

const router = express.Router()

router.get("/me", protectedRoute, getMe)
router.post("/signup", signupController)
router.post("/login", loginController)
router.post("/logout", logoutController)


export default router