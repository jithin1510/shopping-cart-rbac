const express=require("express")
const userController=require("../controllers/User")
const { verifyToken } = require("../middleware/VerifyToken")
const { authorizeRoles } = require("../middleware/RoleAuth")
const router=express.Router()

router
    .get("/vendors/all", verifyToken, authorizeRoles('admin'), userController.getAllVendors)
    .patch("/vendors/approve/:id", verifyToken, authorizeRoles('admin'), userController.approveVendor)
    .get("/:id", verifyToken, userController.getById)
    .patch("/:id", verifyToken, userController.updateById)

module.exports=router