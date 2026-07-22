import axios from 'axios'

const productApiInstance = axios.create({
    baseURL: "http://localhost:3000/api/products",
    withCredentials: true
})

export const createProduct = async (formData) => {
    const response = await productApiInstance.post('/', formData)
    return response.data
}

export const getSellerProduct = async () => {
    const response = await productApiInstance.get('/seller')
    return response.data
}

export const getAllProducts = async () => {
    const response = await productApiInstance.get('/')
    return response.data
}

export const getProductById = async (productId) => {
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export const createVariant = async (productId, formData) => {
    const response = await productApiInstance.post(`/${productId}/variants`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

export const updateVariant = async (productId, variantId, formData) => {
    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

export const deleteVariant = async (productId, variantId) => {
    const response = await productApiInstance.delete(`/${productId}/variants/${variantId}`)
    return response.data
}

export const updateProduct = async (productId, formData) => {
    const response = await productApiInstance.put(`/${productId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}

export const deleteProduct = async (productId, keepVariants) => {
    const response = await productApiInstance.delete(`/${productId}?keepVariants=${keepVariants}`)
    return response.data
}