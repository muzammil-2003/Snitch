import userModel from "../models/user.model.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

async function sendTokenResponse(user, res) {
    const token = jwt.sign({
        id: user._id
    }, config.JWT_SECRET)
}

export const register = catchAsync((req, res) => {
    const {email, contact, password, fullName} = req.body
    const existingUser = await userModel.findOne({
        $or: [ {email}, {contact}]
    })
    if (existingUser) {
        return res.status(400).json({message: "User with this email or contact already exixts."})
    }
    const user = await userModel.create({email, contact, password, fullName})
})