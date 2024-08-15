import Post from "../models/posts.model.js"
import User from "../models/user.model.js"
import { v2 as cloudinary } from "cloudinary"

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

    let post = await Post.findById(postId)

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

    res.status(200).json({message: "Comment successfully posted."})


}