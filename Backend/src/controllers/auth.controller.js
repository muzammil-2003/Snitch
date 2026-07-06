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