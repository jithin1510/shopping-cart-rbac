const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")

exports.create=async(req,res)=>{
    try {
        // Add vendor ID from authenticated user
        const productData = {
            ...req.body,
            vendor: req.user._id
        }
        
        const created=new Product(productData)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding product, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:req.query.brand}
        }

        if(req.query.category){
            filter.category={$in:req.query.category}
        }

        if(req.query.user){
            filter['isDeleted']=false
        }
        
        // Filter by vendor if requested
        if(req.query.vendor){
            filter.vendor = req.query.vendor
        }
        
        // If vendor is viewing their products
        if(req.user && req.user.role === 'vendor' && req.query.myProducts){
            filter.vendor = req.user._id
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").populate("vendor", "name email").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
    }
};

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await Product.findById(id).populate("brand").populate("category").populate("vendor", "name email")
        
        // Return 404 if product doesn't exist
        if (!result) {
            return res.status(404).json({message: 'Product not found'})
        }
        
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        
        // Check if vendor is updating their own product
        if(req.user.role === 'vendor') {
            const product = await Product.findById(id)
            if(!product) {
                return res.status(404).json({message: 'Product not found'})
            }
            
            if(product.vendor.toString() !== req.user._id.toString()) {
                return res.status(403).json({message: 'You can only update your own products'})
            }
        }
        
        const updated=await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating product, please try again later'})
    }
}

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        
        // Check if vendor is restoring their own product
        if(req.user.role === 'vendor') {
            const product = await Product.findById(id)
            if(!product) {
                return res.status(404).json({message: 'Product not found'})
            }
            
            if(product.vendor.toString() !== req.user._id.toString()) {
                return res.status(403).json({message: 'You can only restore your own products'})
            }
        }
        
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        
        // Check if vendor is deleting their own product
        if(req.user.role === 'vendor') {
            const product = await Product.findById(id)
            if(!product) {
                return res.status(404).json({message: 'Product not found'})
            }
            
            if(product.vendor.toString() !== req.user._id.toString()) {
                return res.status(403).json({message: 'You can only delete your own products'})
            }
        }
        
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}

exports.getVendorProducts = async (req, res) => {
    try {
        if(!req.user || req.user.role !== 'vendor') {
            return res.status(403).json({message: 'Unauthorized access'})
        }
        
        const filter = { vendor: req.user._id }
        const products = await Product.find(filter).populate("brand").populate("category")
        
        res.status(200).json(products)
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error fetching vendor products'})
    }
}

