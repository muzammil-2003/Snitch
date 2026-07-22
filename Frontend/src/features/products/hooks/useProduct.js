import { createProduct, getSellerProduct, getAllProducts, getProductById, createVariant, updateVariant, deleteVariant, updateProduct, deleteProduct } from '../service/product.api.js'
import { useDispatch } from 'react-redux'
import { setSellerProducts, setProducts } from '../state/product.slice.js'

export const useProduct = () => {

    const dispatch = useDispatch()

    const handleCreateProduct = async (formData) => {
        const data = await createProduct(formData)
        return data.product
    }

    const handleGetSellerProduct = async () => {
        const data = await getSellerProduct()
        dispatch(setSellerProducts(data.products))
        return data.product
    }

    const handleGetAllProducts = async () => {
        const data = await getAllProducts()
        dispatch(setProducts(data.products))
    }

    const handleGetProductById = async (productId) => {
        const data = await getProductById(productId)
        return data.product
    }

    const handleCreateVariant = async (productId, formData) => {
        const data = await createVariant(productId, formData)
        return data.product
    }

    const handleUpdateVariant = async (productId, variantId, updateData) => {
        const data = await updateVariant(productId, variantId, updateData)
        return data.product
    }

    const handleDeleteVariant = async (productId, variantId) => {
        const data = await deleteVariant(productId, variantId)
        return data.product
    }

    const handleUpdateProduct = async (productId, updateData) => {
        const data = await updateProduct(productId, updateData)
        return data.product
    }

    const handleDeleteProduct = async (productId, keepVariants) => {
        const data = await deleteProduct(productId, keepVariants)
        return data
    }

    return { 
        handleCreateProduct, 
        handleGetSellerProduct, 
        handleGetAllProducts, 
        handleGetProductById,
        handleCreateVariant,
        handleUpdateVariant,
        handleDeleteVariant,
        handleUpdateProduct,
        handleDeleteProduct
    }
}