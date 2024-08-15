import expess from "express";
import { createPostController, deletePostController } from "../controllers/post.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = expess.Router()

router.post("/createPost", protectedRoute, createPostController)
router.delete("/deletePost/:id", protectedRoute, deletePostController)

export default router
