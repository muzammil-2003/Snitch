import { Router } from "express";
import { validateRegisterUser, validateLoginUser } from "../validator/auth.validator.js";
import { login, register, googleCallback, getMe, logout } from "../controllers/auth.controller.js";
import passport from "passport";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = Router()

router.post('/register', validateRegisterUser, register)
router.post('/login', validateLoginUser, login)
router.post('/logout', logout)
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}))
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/login', session: false}), googleCallback)
router.get('/me', authenticateUser, getMe)

export default router