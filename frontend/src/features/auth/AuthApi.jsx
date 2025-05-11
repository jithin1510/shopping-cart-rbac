import {axiosi} from '../../config/axios'

export const signup=async(cred)=>{
    try {
        // Log data being sent (without password)
        const logData = { ...cred };
        delete logData.password;
        console.log("Signup data being sent:", logData);
        
        // Make API call
        const res = await axiosi.post("auth/signup", cred);
        console.log("Signup response:", res.data);
        return res.data;
    } catch (error) {
        // Enhanced error logging
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Signup error response:", {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
            throw error.response.data;
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Signup error - no response:", error.request);
            throw { message: "No response from server. Please check your connection." };
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Signup error:", error.message);
            throw { message: error.message || "An unexpected error occurred" };
        }
    }
}
export const login=async(cred)=>{
    try {
        const res=await axiosi.post("auth/login",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const verifyOtp=async(cred)=>{
    try {
        const res=await axiosi.post("auth/verify-otp",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const resendOtp=async(cred)=>{
    try {
        const res=await axiosi.post("auth/resend-otp",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const forgotPassword=async(cred)=>{
    try {
        const res=await axiosi.post("auth/forgot-password",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const resetPassword=async(cred)=>{
    try {
        const res=await axiosi.post("auth/reset-password",cred)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const checkAuth=async(cred)=>{
    try {
        const res=await axiosi.get("auth/check-auth")
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const logout=async()=>{
    try {
        const res=await axiosi.get("auth/logout")
        return res.data
    } catch (error) {
        throw error.response.data
    }
}