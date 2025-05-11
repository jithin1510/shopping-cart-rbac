// Role-based authorization middleware
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Please login first" });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Role (${req.user.role}) is not allowed to access this resource` 
            });
        }
        
        next();
    };
};

// Middleware to check if vendor is approved
exports.isApprovedVendor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Please login first" });
    }
    
    if (req.user.role === 'vendor' && !req.user.isApproved) {
        return res.status(403).json({ 
            message: "Your vendor account is pending approval from admin" 
        });
    }
    
    next();
};

// Middleware to check if user is the owner of the product
exports.isProductOwner = async (req, res, next) => {
    try {
        const Product = require('../models/Product');
        const productId = req.params.id;
        
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        // Check if the product belongs to the logged-in vendor
        if (req.user.role === 'vendor' && product.vendor && product.vendor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to perform this action on this product" });
        }
        
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error checking product ownership" });
    }
};