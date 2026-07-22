import productModel from '../models/product.model.js'
import catchAsync from '../utils/catchAsync.js'
import { uploadFile } from '../services/storage.service.js'

export const createProduct = catchAsync(async (req, res) => {
    const {title, description, priceAmount, priceCurrency} = req.body
    const seller = req.user
    const images = await Promise.all(req.files.map(async (file) => {
        return await uploadFile({
            buffer: file.buffer,
            fileName: file.originalname
        })
    }))

    const product = await productModel.create({
        title, description, price: {
            amount: priceAmount,
            currency: priceCurrency || 'PKR'
        },
        images,
        seller: seller._id
    })

    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
})

export const getSellerProducts = catchAsync(async (req, res) => {
    const seller = req.user
    const products = await productModel.find({ seller: seller._id, isDeleted: { $ne: true } })
    res.status(200).json({
        message: "Products fetched successfully.",
        success: true,
        products
    })
})

export const getAllProducts = catchAsync(async (req, res) => {
    const products = await productModel.find({ isDeleted: { $ne: true } })
    res.status(200).json({
        message: "Products fetched successfully.",
        success: true,
        products
    })
})

export const getProductDetails = catchAsync(async (req, res) => {
    const {id} = req.params
    const product = await productModel.findById(id)
    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }
    return res.status(200).json({
        message: "Product fetched successfully",
        success: true,
        product
    })
})

export const createVariant = catchAsync(async (req, res) => {
    const { productId } = req.params
    const seller = req.user
    const product = await productModel.findById(productId)

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }

    if (product.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({
            message: "Unauthorized: You are not the seller of this product.",
            success: false
        })
    }

    const { priceAmount, priceCurrency, stock, attributes } = req.body

    let images = []
    if (req.files && req.files.length > 0) {
        images = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))
    }

    let parsedAttributes = {}
    if (attributes) {
        try {
            parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes
        } catch (e) {
            console.error("Failed to parse attributes:", e)
        }
    }

    const newVariant = {
        price: {
            amount: Number(priceAmount),
            currency: priceCurrency || 'PKR'
        },
        stock: Number(stock) || 0,
        attributes: parsedAttributes,
        images: images.map(img => ({ url: img.url }))
    }

    product.variants.push(newVariant)
    await product.save()

    res.status(201).json({
        message: "Variant added successfully",
        success: true,
        product
    })
})

export const updateVariant = catchAsync(async (req, res) => {
    const { productId, variantId } = req.params
    const seller = req.user
    const product = await productModel.findById(productId)

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }

    if (product.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({
            message: "Unauthorized: You are not the seller of this product.",
            success: false
        })
    }

    const variant = product.variants.id(variantId)
    if (!variant) {
        return res.status(404).json({
            message: "Variant not found.",
            success: false
        })
    }

    const { stock, priceAmount, priceCurrency, attributes, keepImages } = req.body

    if (stock !== undefined) variant.stock = Number(stock)
    if (priceAmount !== undefined) variant.price.amount = Number(priceAmount)
    if (priceCurrency !== undefined) variant.price.currency = priceCurrency

    if (attributes !== undefined) {
        let parsedAttributes = {}
        try {
            parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes
        } catch (e) {
            console.error("Failed to parse attributes:", e)
        }
        variant.attributes = parsedAttributes
    }

    // Handle image updates
    let updatedImages = variant.images || []
    if (keepImages !== undefined) {
        let parsedKeepImages = []
        try {
            parsedKeepImages = typeof keepImages === 'string' ? JSON.parse(keepImages) : keepImages
        } catch (e) {
            console.error("Failed to parse keepImages:", e)
        }
        // Filter existing variant images to keep only those specified
        updatedImages = updatedImages.filter(img => parsedKeepImages.includes(img.url))
    }

    // Upload and append new images if any
    if (req.files && req.files.length > 0) {
        const uploadedFiles = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))
        uploadedFiles.forEach(img => {
            updatedImages.push({ url: img.url })
        })
    }
    variant.images = updatedImages

    await product.save()

    res.status(200).json({
        message: "Variant updated successfully",
        success: true,
        product
    })
})

export const deleteVariant = catchAsync(async (req, res) => {
    const { productId, variantId } = req.params
    const seller = req.user
    const product = await productModel.findById(productId)

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }

    if (product.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({
            message: "Unauthorized: You are not the seller of this product.",
            success: false
        })
    }

    product.variants.pull({ _id: variantId })
    await product.save()

    res.status(200).json({
        message: "Variant deleted successfully",
        success: true,
        product
    })
})

export const updateProduct = catchAsync(async (req, res) => {
    const { productId } = req.params
    const seller = req.user
    const product = await productModel.findById(productId)

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }

    if (product.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({
            message: "Unauthorized: You are not the seller of this product.",
            success: false
        })
    }

    const { title, description, priceAmount, priceCurrency, keepImages } = req.body

    if (title !== undefined) product.title = title
    if (description !== undefined) product.description = description
    if (priceAmount !== undefined) product.price.amount = Number(priceAmount)
    if (priceCurrency !== undefined) product.price.currency = priceCurrency

    // Handle image updates
    let updatedImages = product.images || []
    if (keepImages !== undefined) {
        let parsedKeepImages = []
        try {
            parsedKeepImages = typeof keepImages === 'string' ? JSON.parse(keepImages) : keepImages
        } catch (e) {
            console.error("Failed to parse keepImages:", e)
        }
        updatedImages = updatedImages.filter(img => parsedKeepImages.includes(img.url))
    }

    // Upload new files if any
    if (req.files && req.files.length > 0) {
        const uploadedFiles = await Promise.all(req.files.map(async (file) => {
            return await uploadFile({
                buffer: file.buffer,
                fileName: file.originalname
            })
        }))
        uploadedFiles.forEach(img => {
            updatedImages.push({ url: img.url })
        })
    }
    product.images = updatedImages

    await product.save()

    res.status(200).json({
        message: "Product updated successfully.",
        success: true,
        product
    })
})

export const deleteProduct = catchAsync(async (req, res) => {
    const { productId } = req.params
    const seller = req.user
    const product = await productModel.findById(productId)

    if (!product) {
        return res.status(404).json({
            message: "Product not found.",
            success: false
        })
    }

    if (product.seller.toString() !== seller._id.toString()) {
        return res.status(403).json({
            message: "Unauthorized: You are not the seller of this product.",
            success: false
        })
    }

    const keepVariants = req.query.keepVariants === 'true'

    if (keepVariants) {
        product.isDeleted = true
        await product.save()
        res.status(200).json({
            message: "Product deleted, variants preserved.",
            success: true,
            product
        })
    } else {
        await productModel.findByIdAndDelete(productId)
        res.status(200).json({
            message: "Product and variants deleted completely.",
            success: true
        })
    }
})