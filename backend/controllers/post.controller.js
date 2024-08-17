import Post from "../models/posts.model.js"
import User from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"

export const getAllPosts = async (req, res, next) => {
    try {
       const allPosts = await Post.find().sort({createdAt: -1}).populate({
        path: "user",
        select: "-password"
       })
       
       if(!allPosts) {
        return res.status(200).json({message: "No posts available."})
       }

       return res.status(200).json(allPosts)

    } catch (error) {
        console.log("Error in getAllPosts controller:", error.message)
        res.status(400).json({error: "Internal server error"})
    }
}

export const createPostController = async (req, res, next) => {
    let {text} = req.body
    let {img} = req.body
    let userId = req.user._id.toString()

    try {
        let user = await User.findById(userId)

        if(!user) {
            res.status(400).json({message: "User doesn't exists!"})
        }

        if(!text && !img) {
            res.status(400).json({message: "Please type in something or include an image for posting."})
        }

        if(img) {
            const postImg = cloudinary.uploader.upload(img)
            img = postImg.secure_url
        }

        const newPost =  new Post({
            user: userId,
            text: text,
            img: img,
        })

        await newPost.save()

        res.status(300).json(newPost)

    } catch (error) {
        console.log("Error in createPostController:", error.message)
        return res.status(400).json({error: "Internal server error"})
    }
}


export const deletePostController = async (req, res, next) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId)
        const userId = req.user._id

        if(!post) {
            res.status(400).json({message: "Couldn't find the post"})
        }

        if(post.user.toString() !== userId) {
            res.status(400).json({message: "You are not authorised to delete this post!"})
        }

        if(post.img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }

        const deleteSuccess = await Post.findByIdAndDelete(postId)

        if(!deleteSuccess) {
            res.status(400).json({message: "Unable to delete the post"})
        }

        res.status(200).json({message: "Post deleted successfully!"})


    } catch (error) {
        res.status(400).json({error: "Internal server error"})
        console.log("Error while deleting the post:", error.message)
    }
}

export const commentOnPost = async (req, res, next) => {
    const postId = req.params.id;

    const {text} = req.body

    const userId = req.user._id.toString()

    let post = await Post.findById(postId).sort({createdAt: -1}).populate({
        path: "comments.user",
        select: "-password"
    })

    if(!text) {
        res.status(400).json({message: "Text field is requierd!"})
    }
    if(!post) {
        res.status(400).json({message: "Post not found."})
    }

    const comment = {
        text, user:userId
    }
    post.comments.push(comment)

    await post.save()

    res.status(200).json(post)
}

export const likeUnlikePost = async(req, res, next) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id.toString()
        const post = await Post.findById(postId)

        if(!post) {
            return res.status(400).json({message: "Post not available!"})
        }

        const isLiked =  post.likes.some((like) => like == userId) 
        
        if(isLiked) {
            const index = post.likes.indexOf(userId)

            if(index > -1) {
                post.likes.splice(index, 1)
                console.log("Post unliked")
            }
            await User.updateOne({_id: userId}, { $pull: {likedPosts: postId}})
        }

        else {
            post.likes.push(userId)
            console.log("Post liked: ", post.likes)
            await User.updateOne({_id: userId}, { $push: {likedPosts: postId}})
        }

        await post.save()

        res.status(200).json(post)

    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error.message)

        res.status(400).json({error: "Internal server error"})
    }
}

export const getLikedPosts = async (req, res, next) => {
    const userId = req.params.id

    try {
        const user = await User.findById(userId)

        if(!user) {
            return res.status(400).json({message: "User not found."})
        }

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})
        .populate({
            path: "user",
            select: "-password"
        })
        .populate({
            path: "comments.user",
            select: "-password"
        })


        return res.status(200).json(likedPosts)
    } catch (error) {
        console.log("Error in likeUnlikePost controller:", error.message)
        res.status(400).json({error: "Internal server error"}) 
    }
}