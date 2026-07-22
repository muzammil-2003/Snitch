import express from 'express'
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validateAddToCart } from '../validator/cart.validator.js';
import { addToCart } from '../controllers/cart.controller.js';

const router = express.Router()

router.post('/add/:productId/:variantId', authenticateUser, validateAddToCart, addToCart)

export default router