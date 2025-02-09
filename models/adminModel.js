 const mongoose=require("mongoose")

 const adminSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
     lastname:{
        type:String,
        required:true
    },
     email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    }
 })

 const admins=mongoose.model("admins",adminSchema)

 module.exports=admins