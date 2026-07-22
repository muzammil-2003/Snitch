import express from 'express'
import { authenticateSeller } from '../middlewares/auth.middleware.js'
import { createProduct, getAllProducts, getSellerProducts, getProductDetails, createVariant, updateVariant, deleteVariant, updateProduct, deleteProduct } from '../controllers/product.controller.js'
import multer from 'multer'
import { createProductValidator } from '../validator/product.validator.js'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
})

const router = express.Router()

router.post('/', authenticateSeller, upload.array('images', 7), createProductValidator, createProduct)
router.get('/seller', authenticateSeller, getSellerProducts)
router.get('/', getAllProducts)
router.get('/detail/:id', getProductDetails)

// Product edit & delete routes
router.put('/:productId', authenticateSeller, upload.array('images', 7), updateProduct)
router.delete('/:productId', authenticateSeller, deleteProduct)

// Variant Management routes
router.post('/:productId/variants', authenticateSeller, upload.array('images', 7), createVariant)
router.patch('/:productId/variants/:variantId', authenticateSeller, upload.array('images', 7), updateVariant)
router.delete('/:productId/variants/:variantId', authenticateSeller, deleteVariant)

export default router