import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: 'product',
    initialState: {
        sellerProduct: [],
        products: []
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProduct = action.payload
        },
        setProducts: (state, action) => {
            state.products = action.payload
        }
    }
})

export const { setSellerProducts, setProducts } = productSlice.actions
export default productSlice.reducer