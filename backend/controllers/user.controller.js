import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";



export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const userProfile = await User.findOne({ username }).select("-password")

        if (!userProfile) {
            return res.status(404).json({ message: "User not found." })
        }

        res.status(200).json(userProfile)

    } catch (error) {
        console.log("Error in getUserProfile controllers:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}
export const suggestedProfile = async (req, res) => {
    try {
        const userId = req.user._id

        usersIFollow = await User.findById(userId).select("following")

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            },
            { $sample: { size: 10 } }
        ])

        const filteredUsers = users.filter(user => !usersIFollow.following.includes(user._id))

        const suggestedUsers = filteredUsers.slice(0, 4)

        suggestedUsers.forEach(user => user.password = null)

        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log("Error in suggestedProfile controllers:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)

        const currentUser = await User.findById(req.user._id)

        if (id == req.user._id) {
            return res.status(400).json({ error: "Can't follow/unfollow yourself." })
        }

        if (!userToModify || !currentUser) {
            return res.status(400).json({ error: "User not found." })
        }


        const isFollowing = currentUser.following.includes(id)

        if (isFollowing) {
            //Unfollow
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            res.status(200).json({ message: "User unfollowed successfully." })
        }

        else {
            //follow
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            res.status(200).json({ message: "User followed successfully." })
        }




    } catch (error) {
        console.log("Error in follow and unfollow controllers:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}
export const UpdateUserProfile = async (req, res) => {
    const { fullname, email, username, currentPassword, newPassword, bio, link } = req.body
    const { profileImg, coverImg } = req.body

    const userId = req.user._id
    try {
        let user = await User.findById(userId)
        console.log("CurrentPassword:", user)

        if (!user) {
            return res.status(400).json({ error: "No user found in the database." })
        }

        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ message: "Please provide both current password and new password." })
        }

        if (newPassword && currentPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password)

            if (!isMatch) {
                return res.status(400).json({ message: "The current password provided is invalid." })
            }

            else {
                const salt = await bcrypt.genSalt(10)
                user.password = await await bcrypt.hash(newPassword, salt)
            }


        }
        if (profileImg) {
            if (user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }

        if (coverImg) {
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }


        user.fullname = fullname || user.fullname;
        user.username = username || user.username
        user.email = email || user.email;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save()


        user.password = null;

        return res.status(200).json(user)
    } catch (error) {
        res.status(400).json("Internal server error")
        console.log("Error in updateUserProfile controller:", error.message)
    }
}
