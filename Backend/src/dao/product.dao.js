import productModel from "../models/product.model.js";
import catchAsync from "../utils/catchAsync.js";

export const stockOfVariant = catchAsync(async (productId, variantId) => {
    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    const stock = product.variants.find(variant => variant._id.toString() === variantId).stock
    return stock
})