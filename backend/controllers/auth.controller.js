import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

export const signupController = async (req, res, next) => {
    try {
        const { username, fullname, email, password } = req.body

        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+&/;

        // if(!emailRegex.test(email)) {
        //     return res.status(400).json({ error: "Invalid email format" });
        // }


        const existingUser = await User.findOne({ username })

        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" })
        }

        const existingEmail = await User.findOne({ email })

        if (existingEmail) {
            return res.status(400).json({ error: "Email already exists!" })
        }


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            username,
            fullname,
            email,
            password: hashedPassword
        })


        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)

            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                email: newUser.email,
                username: newUser.username,
                followers: newUser.followers,
                following: newUser.following,
                coverImg: newUser.coverImg,

            })
        }
        else {
            res.status(400).json({ error: "Invalid user data" })
        }

    } catch (error) {
        console.log("Internal server error")
        res.status(500).json({ error: "Error in signup controller" })
    }
}
export const loginController = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username })


        const validPassword = bcrypt.compare(password, user?.password || "")

        if (!validPassword || !user) {
            return res.status(400).json({ error: "Invalid credentials." })
        }

        generateTokenAndSetCookie(user._id, res)


        res.status(201).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            followers: user.followers,
            following: user.following,
            coverImg: user.coverImg,

        })

    } catch (error) {
        console.log("Internal server error")
        res.status(500).json({ error: "Error in login controller" })
    }
}
export const logoutController = (req, res, next) => { 
    try {
        res.cookie("jwt", "", {maxAge: 0})

        res.status(200).json({message: "Logged out successfully!"})
    } catch (error) {
        console.log("Internal server error")
        res.status(500).json({ error: "Error in logout controller" })
    }
}

export const getMe = async (req, res) => {
    try {
        console.log("User credentials: ",req.user)
        const user = await User.findById(req.user._id)
        res.status(200).json(user)

    } catch (error) {
        console.log("Error in getting my details:", error.message)
        res.status(500).json({ error: "Internal server error" })
    }
}
