import { axiosi } from "../../config/axios";

export const addProduct=async(data)=>{
    try {
        const res=await axiosi.post('/products',data)
        return res.data
    } catch (error) {
        console.error("Error adding product:", error);
        throw error.response?.data || { message: "Error adding product, please try again later" }
    }
}

export const fetchProducts=async(filters)=>{
    let queryString=''

    if(filters.brand){
        filters.brand.map((brand)=>{
            queryString+=`brand=${brand}&`
        })
    }
    if(filters.category){
        filters.category.map((category)=>{
            queryString+=`category=${category}&`
        })
    }

    if(filters.pagination){
        queryString+=`page=${filters.pagination.page}&limit=${filters.pagination.limit}&`
    }

    if(filters.sort){
        queryString+=`sort=${filters.sort.sort}&order=${filters.sort.order}&`
    }

    if(filters.user){
        queryString+=`user=${filters.user}&`
    }
    
    try {
        const res=await axiosi.get(`/products?${queryString}`)
        const totalResults=await res.headers.get("X-Total-Count")
        return {data:res.data,totalResults:totalResults}
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error.response?.data || { message: "Failed to load products. Please try again later." }
    }
}

export const fetchProductById=async(id)=>{
    try {
        const res=await axiosi.get(`/products/${id}`)
        return res.data
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error.response?.data || { message: "Failed to load product details. Please try again later." }
    }
}

export const updateProductById=async(update)=>{
    try {
        const res=await axiosi.patch(`/products/${update._id}`,update)
        return res.data
    } catch (error) {
        console.error("Error updating product:", error);
        throw error.response?.data || { message: "Error updating product, please try again later" }
    }
}

export const undeleteProductById=async(id)=>{
    try {
        const res=await axiosi.patch(`/products/undelete/${id}`)
        return res.data
    } catch (error) {
        console.error("Error undeleting product:", error);
        throw error.response?.data || { message: "Error restoring product, please try again later" }
    }
}

export const deleteProductById=async(id)=>{
    try {
        const res=await axiosi.delete(`/products/${id}`)
        return res.data
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error.response?.data || { message: "Error deleting product, please try again later" }
    }
}

export const fetchVendorProducts=async()=>{
    try {
        const res=await axiosi.get('/products/vendor/my-products')
        return res.data
    } catch (error) {
        console.error("Error fetching vendor products:", error);
        throw error.response?.data || { message: "Failed to load products. Please try again later." }
    }
}