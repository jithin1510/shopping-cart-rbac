const User=require("../models/User")

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=(await User.findById(id)).toObject()
        delete result.password
        res.status(200).json(result)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        
        // Prevent role changes through this endpoint
        if (req.body.role || req.body.isAdmin || req.body.isApproved) {
            delete req.body.role;
            delete req.body.isAdmin;
            delete req.body.isApproved;
        }
        
        const updated=(await User.findByIdAndUpdate(id,req.body,{new:true})).toObject()
        delete updated.password
        res.status(200).json(updated)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting your details, please try again later'})
    }
}

// Get all vendors for admin approval
exports.getAllVendors = async(req, res) => {
    try {
        // Only admin can access this endpoint
        if (!req.user.isAdmin && req.user.role !== 'admin') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        const vendors = await User.find({role: 'vendor'}).select('-password');
        res.status(200).json(vendors);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error fetching vendors'});
    }
}

// Approve or reject vendor
exports.approveVendor = async(req, res) => {
    try {
        // Only admin can access this endpoint
        if (!req.user.isAdmin && req.user.role !== 'admin') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        const {id} = req.params;
        const {isApproved} = req.body;
        
        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({message: 'isApproved must be a boolean value'});
        }
        
        const vendor = await User.findById(id);
        
        if (!vendor) {
            return res.status(404).json({message: 'Vendor not found'});
        }
        
        if (vendor.role !== 'vendor') {
            return res.status(400).json({message: 'User is not a vendor'});
        }
        
        const updated = await User.findByIdAndUpdate(
            id, 
            {isApproved}, 
            {new: true}
        ).select('-password');
        
        res.status(200).json(updated);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error updating vendor status'});
    }
}