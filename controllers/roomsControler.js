const rooms=require('../models/roomModel')
const hotel=require('../models/hotelModel')

exports.addRoomsController=async(req,res)=>{
    console.log("inside add rooms controller");

    const{hotelId,roomType,occupancy,numberOfRooms,pricePerNight,description,amenities 
    }=req.body

    const images = req.files.map(file => file.filename);
    const adminId=req.adminId

    try{
        const roomAddingHotel=await hotel.findOne({_id:hotelId})
        if(roomAddingHotel){
            const newRoom=new rooms({hotelId,roomType,numberOfRooms,occupancy,pricePerNight,description,amenities,images,adminId})
            const savedRoom = await newRoom.save();


            await hotel.findByIdAndUpdate(hotelId, { $push: { rooms: savedRoom._id } });

            res.status(200).json(newRoom)
        }else{
            res.status(404).json("No hotel found with hotelId")
        }
        


    }catch(err){
        res.status(500).json(err)
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
        res.status(500).json(err)
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
        res.status(500).json(err)
    }
}

exports.getRoomByRoomIdController=async(req,res)=>{
    console.log("get room by room id controller");

    const {roomId}=req.params
    try{
        const roomDetails=await rooms.findById(roomId)
        res.status(200).json(roomDetails)
    }
    catch(err){
        res.status(500).json(err)
    }
    
}

exports.editRoomsController = async (req, res) => {
    try {
        const { roomId } = req.params; 
        const{roomType,occupancy,numberOfRooms,pricePerNight,description,amenities,existingImages}=req.body
     
        const room = await rooms.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Handle images: Keep old ones & add new ones
        const newImages = req.files.map(file => file.filename); // Uploaded images
        const updatedImages = [...(existingImages || []), ...newImages]; // Combine existing + new images

        room.roomType = roomType;
        room.occupancy = occupancy;
        room.numberOfRooms =numberOfRooms;
        room.pricePerNight = pricePerNight;
        room.description = description;
        room.amenities = amenities;
        room.images = updatedImages;

     
        // Save updated hotel
        await room.save();

        res.status(200).json({ message: "Room updated successfully", room });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err });
    }
};
