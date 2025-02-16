const rooms=require('../models/roomModel')
const hotel=require('../models/hotelModel')

exports.addRoomsController=async(req,res)=>{
    console.log("inside add rooms controller");

    const{hotelId,roomType,numberOfRooms,pricePerNight,description,amenities 
    }=req.body

    const images = req.files.map(file => file.filename);
    const adminId=req.adminId

    try{
        const roomAddingHotel=await hotel.findOne({_id:hotelId})
        if(roomAddingHotel){
            const newRoom=new rooms({hotelId,roomType,numberOfRooms,pricePerNight,description,amenities,images,adminId})
            const savedRoom = await newRoom.save();


            await hotel.findByIdAndUpdate(hotelId, { $push: { rooms: savedRoom._id } });

            res.status(200).json(newRoom)
        }else{
            res.status(404).json("No hotel found with hotelId")
        }
        


    }catch(err){
        res.status(401).json(err)
    }
}

exports.getRoomDetailsController=async(req,res)=>{
    console.log("inisde get room detials controller");
    const {hotelId}=req.body
    console.log(hotelId);
    
    try{const roomsWithHotelId=await rooms.find({hotelId})
    if(roomsWithHotelId){
        res.status(200).json(roomsWithHotelId)
    }else{
        res.status(404).json("no rooms find for the hotel")
    }}catch(err){
        res.status(401).json(err)
    }
    
}

exports.deleteRoomController=async(req,res)=>{
    console.log("inside delete room controller");

    const{_id}=req.body
    try{

        const deletedRoom=await rooms.findByIdAndDelete({_id})

        if(deletedRoom){
            res.status(200).json(deletedRoom)
        }
        else{
            res.status(404).json("No room found in this id")

        }

    }
    catch(err){
        res.status(401).json(err)
    }
}