import express from "express"
import { loginController, logoutController, signupController } from "../controllers/auth.controller.js"

const router = express.Router()

router.use("/login", loginController)
router.use("/signup", signupController)
router.use("/logout", logoutController)


export default router