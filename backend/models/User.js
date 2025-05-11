const mongoose=require("mongoose")
const {Schema}=mongoose

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer'
    },
    isApproved:{
        type:Boolean,
        default:function() {
            return this.role === 'customer' || this.role ==='admin'; // Only customers are auto-approved
        }
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model("User",userSchema)