import { createProduct, getSellerProduct } from '../service/product.api.js'
import {useDispatch} from 'react-redux'
import { setSellerProducts } from '../state/product.slice.js'

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

    return {handleCreateProduct, handleGetSellerProduct}
}