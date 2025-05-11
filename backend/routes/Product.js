const express=require('express')
const productController=require("../controllers/Product")
const { verifyToken } = require("../middleware/VerifyToken")
const { authorizeRoles, isApprovedVendor, isProductOwner } = require("../middleware/RoleAuth")
const router=express.Router()

router
    // Public routes
    .get("/", productController.getAll)
    .get("/:id", productController.getById)
    
    // Vendor routes
    .post("/", verifyToken, authorizeRoles('vendor', 'admin'), isApprovedVendor, productController.create)
    .get("/vendor/my-products", verifyToken, authorizeRoles('vendor'), productController.getVendorProducts)
    .patch("/:id", verifyToken, authorizeRoles('vendor', 'admin'), isProductOwner, productController.updateById)
    .patch("/undelete/:id", verifyToken, authorizeRoles('vendor', 'admin'), isProductOwner, productController.undeleteById)
    .delete("/:id", verifyToken, authorizeRoles('vendor', 'admin'), isProductOwner, productController.deleteById)

module.exports=router