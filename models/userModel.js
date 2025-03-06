const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
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
    },
    savedProperties:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "hotels" 
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    isBanned: { 
        type: Boolean,
        default: false
    },
    banReason: { 
        type: String,
        default: null
    },
    bannedUntil: {
        type: Date,
        default: null
    }
})

const users=mongoose.model("users",userSchema)

module.exports=users