exports.sanitizeUser=(user)=>{
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        role: user.role || 'customer',
        isApproved: user.isApproved !== undefined ? user.isApproved : true
    }
}