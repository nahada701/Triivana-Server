const mongoose=require("mongoose")

const hotelSchema=new mongoose.Schema({
    propertyname:{
        type:String,
        required:true
    },
    propertytype:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    minPrice:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    checkin:{
        type:String,
        required:true
    },
    checkout:{
        type:String,
        required:true
    },
    amenities:[{
        type:String,
    }],
    images:[{
        type:String,
        required:true
    }],
    reviews: [
        { type: mongoose.Schema.Types.ObjectId, ref: "reviews" }
    ],
    rooms: [
        { type: mongoose.Schema.Types.ObjectId, ref: "rooms" }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    adminId:{
        type:String,
        required:true
    }

})

const hotels=mongoose.model("hotels",hotelSchema)

module.exports=hotels