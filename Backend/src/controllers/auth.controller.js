import userModel from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res, message) {
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, { expiresIn: '7d' })

    res.cookie('token', token)

    res.status(200).json({
        message,
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullName: user.fullName,
            role: user.role
        }
    })
}

export const register = catchAsync(async (req, res) => {
    const { email, contact, password, fullName, isSeller } = req.body
    const existingUser = await userModel.findOne({
        $or: [{ email }, { contact }]
    })
    if (existingUser) {
        return res.status(400).json({ message: "User with this email or contact already exixts." })
    }
    const user = await userModel.create({ email, contact, password, fullName, role: isSeller ? "seller" : "buyer" })
    await sendTokenResponse(user, res, "User registered successfully.")
})

export const login = catchAsync(async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password." })
    }
    const isMatch = await user.comparePasswords(password)
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." })
    }
    await sendTokenResponse(user, res, "User logged in successfully.")
})

export const googleCallback = catchAsync(async (req, res) => {
    const { id, displayName, emails, photos } = req.user
    const email = emails[0].value
    const profilePic = photos[0].value

    let user = await userModel.findOne({ email })
    if (!user) {
        user = await userModel.create({ googleId: id, email, provider: "google", fullName: displayName, })
    }
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token)
    res.redirect('http://localhost:5173/')
})

export const logout = catchAsync(async (req, res) => {
    res.clearCookie('token')
    res.status(200).json({
        message: "Logged out successfully.",
        success: true,
    })
})

export const getMe = catchAsync(async (req, res) => {
    const user = req.user
    res.status(200).json({
        message: "User fetched successfully",
        success: true,
        user: {
            id: user._id,
            email: user.email,
            contact: user.contact,
            fullName: user.fullName,
            role: user.role
        }
    })
})