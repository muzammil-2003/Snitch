import { Router } from "express";
import { validateRegisterUser, validateLoginUser } from "../validator/auth.validator.js";
import { login, register, googleCallback } from "../controllers/auth.controller.js";
import passport from "passport";

const router = Router()

router.post('/register', validateRegisterUser, register)
router.post('/login', validateLoginUser, login)
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}))
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/login', session: false}), googleCallback)

export default router