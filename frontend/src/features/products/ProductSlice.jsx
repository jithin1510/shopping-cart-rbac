import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  addProduct, 
  deleteProductById, 
  fetchProductById, 
  fetchProducts, 
  fetchVendorProducts, 
  undeleteProductById, 
  updateProductById 
} from "./ProductApi";


const initialState={
    status:"idle",
    productUpdateStatus:'idle',
    productAddStatus:"idle",
    productFetchStatus:"idle",
    vendorProductsStatus: "idle",
    products:[],
    vendorProducts: [],
    totalResults:0,
    isFilterOpen:false,
    selectedProduct:null,
    errors:null,
    successMessage:null
}

export const addProductAsync=createAsyncThunk("products/addProductAsync",async(data, { rejectWithValue })=>{
    try {
        const addedProduct=await addProduct(data)
        return addedProduct
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const fetchProductsAsync=createAsyncThunk("products/fetchProductsAsync",async(filters, { rejectWithValue })=>{
    try {
        const products=await fetchProducts(filters)
        return products
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const fetchProductByIdAsync=createAsyncThunk("products/fetchProductByIdAsync",async(id, { rejectWithValue })=>{
    try {
        const selectedProduct=await fetchProductById(id)
        return selectedProduct
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const updateProductByIdAsync=createAsyncThunk("products/updateProductByIdAsync",async(update, { rejectWithValue })=>{
    try {
        const updatedProduct=await updateProductById(update)
        return updatedProduct
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const undeleteProductByIdAsync=createAsyncThunk("products/undeleteProductByIdAsync",async(id, { rejectWithValue })=>{
    try {
        const unDeletedProduct=await undeleteProductById(id)
        return unDeletedProduct
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const deleteProductByIdAsync=createAsyncThunk("products/deleteProductByIdAsync",async(id, { rejectWithValue })=>{
    try {
        const deletedProduct=await deleteProductById(id)
        return deletedProduct
    } catch (error) {
        return rejectWithValue(error)
    }
})

export const fetchVendorProductsAsync=createAsyncThunk("products/fetchVendorProductsAsync",async(_, { rejectWithValue })=>{
    try {
        const products=await fetchVendorProducts()
        return products
    } catch (error) {
        return rejectWithValue(error)
    }
})

const productSlice=createSlice({
    name:"productSlice",
    initialState:initialState,
    reducers:{
        clearProductErrors:(state)=>{
            state.errors=null
        },
        clearProductSuccessMessage:(state)=>{
            state.successMessage=null
        },
        resetProductStatus:(state)=>{
            state.status='idle'
        },
        clearSelectedProduct:(state)=>{
            state.selectedProduct=null
        },
        resetProductUpdateStatus:(state)=>{
            state.productUpdateStatus='idle'
        },
        resetProductAddStatus:(state)=>{
            state.productAddStatus='idle'
        },
        toggleFilters:(state)=>{
            state.isFilterOpen=!state.isFilterOpen
        },
        resetProductFetchStatus:(state)=>{
            state.productFetchStatus='idle'
        },
        resetVendorProductsStatus:(state)=>{
            state.vendorProductsStatus='idle'
        }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(addProductAsync.pending,(state)=>{
                state.productAddStatus='pending'
            })
            .addCase(addProductAsync.fulfilled,(state,action)=>{
                state.productAddStatus='fullfilled'
                state.products.push(action.payload)
            })
            .addCase(addProductAsync.rejected,(state,action)=>{
                state.productAddStatus='rejected'
                state.errors=action.payload || action.error
            })

            .addCase(fetchProductsAsync.pending,(state)=>{
                state.productFetchStatus='pending'
            })
            .addCase(fetchProductsAsync.fulfilled,(state,action)=>{
                state.productFetchStatus='fullfilled'
                state.products=action.payload.data
                state.totalResults=action.payload.totalResults
            })
            .addCase(fetchProductsAsync.rejected,(state,action)=>{
                state.productFetchStatus='rejected'
                state.errors=action.payload || action.error
            })

            .addCase(fetchProductByIdAsync.pending,(state)=>{
                state.productFetchStatus='pending'
            })
            .addCase(fetchProductByIdAsync.fulfilled,(state,action)=>{
                state.productFetchStatus='fullfilled'
                state.selectedProduct=action.payload
            })
            .addCase(fetchProductByIdAsync.rejected,(state,action)=>{
                state.productFetchStatus='rejected'
                state.errors=action.payload || action.error
            })

            .addCase(updateProductByIdAsync.pending,(state)=>{
                state.productUpdateStatus='pending'
            })
            .addCase(updateProductByIdAsync.fulfilled,(state,action)=>{
                state.productUpdateStatus='fullfilled'
                const index=state.products.findIndex((product)=>product._id===action.payload._id)
                if (index !== -1) {
                    state.products[index]=action.payload
                }
                // Also update in vendor products if present
                const vendorIndex=state.vendorProducts.findIndex((product)=>product._id===action.payload._id)
                if (vendorIndex !== -1) {
                    state.vendorProducts[vendorIndex]=action.payload
                }
            })
            .addCase(updateProductByIdAsync.rejected,(state,action)=>{
                state.productUpdateStatus='rejected'
                state.errors=action.payload || action.error
            })

            .addCase(undeleteProductByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(undeleteProductByIdAsync.fulfilled,(state,action)=>{
                state.status='fullfilled'
                const index=state.products.findIndex((product)=>product._id===action.payload._id)
                if (index !== -1) {
                    state.products[index]=action.payload
                }
                // Also update in vendor products if present
                const vendorIndex=state.vendorProducts.findIndex((product)=>product._id===action.payload._id)
                if (vendorIndex !== -1) {
                    state.vendorProducts[vendorIndex]=action.payload
                }
            })
            .addCase(undeleteProductByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.payload || action.error
            })

            .addCase(deleteProductByIdAsync.pending,(state)=>{
                state.status='pending'
            })
            .addCase(deleteProductByIdAsync.fulfilled,(state,action)=>{
                state.status='fullfilled'
                const index=state.products.findIndex((product)=>product._id===action.payload._id)
                if (index !== -1) {
                    state.products[index]=action.payload
                }
                // Also update in vendor products if present
                const vendorIndex=state.vendorProducts.findIndex((product)=>product._id===action.payload._id)
                if (vendorIndex !== -1) {
                    state.vendorProducts[vendorIndex]=action.payload
                }
            })
            .addCase(deleteProductByIdAsync.rejected,(state,action)=>{
                state.status='rejected'
                state.errors=action.payload || action.error
            })
            
            .addCase(fetchVendorProductsAsync.pending,(state)=>{
                state.vendorProductsStatus='pending'
            })
            .addCase(fetchVendorProductsAsync.fulfilled,(state,action)=>{
                state.vendorProductsStatus='fullfilled'
                state.vendorProducts=action.payload
            })
            .addCase(fetchVendorProductsAsync.rejected,(state,action)=>{
                state.vendorProductsStatus='rejected'
                state.errors=action.payload || action.error
            })
    }
})

// exporting selectors
export const selectProductStatus=(state)=>state.ProductSlice.status
export const selectProducts=(state)=>state.ProductSlice.products
export const selectVendorProducts=(state)=>state.ProductSlice.vendorProducts
export const selectVendorProductsStatus=(state)=>state.ProductSlice.vendorProductsStatus
export const selectProductTotalResults=(state)=>state.ProductSlice.totalResults
export const selectSelectedProduct=(state)=>state.ProductSlice.selectedProduct
export const selectProductErrors=(state)=>state.ProductSlice.errors
export const selectProductSuccessMessage=(state)=>state.ProductSlice.successMessage
export const selectProductUpdateStatus=(state)=>state.ProductSlice.productUpdateStatus
export const selectProductAddStatus=(state)=>state.ProductSlice.productAddStatus
export const selectProductIsFilterOpen=(state)=>state.ProductSlice.isFilterOpen
export const selectProductFetchStatus=(state)=>state.ProductSlice.productFetchStatus

// exporting actions
export const {
    clearProductSuccessMessage,
    clearProductErrors,
    clearSelectedProduct,
    resetProductStatus,
    resetProductUpdateStatus,
    resetProductAddStatus,
    toggleFilters,
    resetProductFetchStatus,
    resetVendorProductsStatus
}=productSlice.actions

export default productSlice.reducer