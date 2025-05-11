require('dotenv').config()
const jwt=require('jsonwebtoken')

exports.generateToken=(payload,passwordReset=false)=>{
    // Include role and approval status in the token
    const tokenData = {
        ...payload,
        role: payload.role || 'customer',
        isApproved: payload.isApproved !== undefined ? payload.isApproved : true
    };
    
    return jwt.sign(tokenData, process.env.SECRET_KEY, {
        expiresIn: passwordReset ? process.env.PASSWORD_RESET_TOKEN_EXPIRATION : process.env.LOGIN_TOKEN_EXPIRATION
    });
}