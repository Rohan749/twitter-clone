import expess from "express";
import { commentOnPost, createPostController, deletePostController, getAllPosts, getLikedPosts, likeUnlikePost } from "../controllers/post.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";

const router = expess.Router()

router.get("/getAllPosts", protectedRoute, getAllPosts)
router.get("/getLikedPosts", protectedRoute, getLikedPosts)
router.post("/createPost", protectedRoute, createPostController)
router.delete("/deletePost/:id", protectedRoute, deletePostController)
router.post("/like/:id", protectedRoute, likeUnlikePost)
router.post("/comment/:id", protectedRoute, commentOnPost)

export default router