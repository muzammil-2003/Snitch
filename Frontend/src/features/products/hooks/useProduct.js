import { createProduct, getSellerProduct, getAllProducts, getProductById } from '../service/product.api.js'
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

    return { handleCreateProduct, handleGetSellerProduct, handleGetAllProducts, handleGetProductById }
}