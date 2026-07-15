import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import catchAsync from '../utils/catchAsync.js'
import userModel from '../models/user.model.js'

export const authenticateSeller = catchAsync(async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized." })
    }
    const decoded = jwt.verify(token, config.JWT_SECRET)
    const user = await userModel.findById(decoded.id)
    if (!user) {
        return res.status(401).json({ message: "Unauthorized." })
    }
    if (user.role !== "seller") {
        return res.status(403).json({message: "Forbidden."})
    }
    req.user = user
    next()
})

export const authenticateUser = catchAsync(async (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        return res.status(401).json({ message: "Unauthorized." })
    }
    const decoded = jwt.verify(token, config.JWT_SECRET)
    const user = await userModel.findById(decoded.id)
    if (!user) {
        return res.status(401).json({ message: "Unauthorized." })
    }
    req.user = user
    next()
})