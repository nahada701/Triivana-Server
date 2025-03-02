const mongoose=require("mongoose")

const bookingSchema=new mongoose.Schema({
    hotelId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"hotels",
        required:true

    },
    roomId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"rooms",
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    name:{
        type:String,
        reequired:true
    },
    email:{
        type:String,
        reequired:true
    },
    phone:{
        type:String,
        required:true
    },
    request:{
        type:String,
        reequired:true
    },
    checkInDate:{
        type:Date,
        required:true
    },
    checkOutDate:{
        type:Date,
        required:true
    },
    numberOfRooms:{
        type:Number,
        requred:true
    }, 
    numberOfAdults:{
        type:Number,
        requred:true
    },
    numberOfChildrens:{
        type:Number,
        requred:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})


const bookings=mongoose.model("bookings",bookingSchema)

module.exports=bookings