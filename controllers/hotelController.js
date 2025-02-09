const hotels = require("../models/hotelModel");
const rooms =require('../models/roomModel')

exports.addHotelController=async(req,res)=>{
    console.log("inside add hotel controller");
    
    try{
        const {  propertyname, propertytype,phone,email,address,description,checkin,checkout,amenities}=req.body
        
        const images = req.files.map(file => file.filename)

        const adminId=req.adminId
        
        const exisistingHotel=await hotels.findOne({propertyname, propertytype,phone,email,address})

        if(exisistingHotel){
            res.status(406).json('hotel already added')
        }
        else{
            const newHotel = new hotels({propertyname,propertytype,phone,email,address,description,checkin,checkout,amenities,images,adminId
        });
        await newHotel.save()

        res.status(200).json(newHotel)}

    }catch(err){
        res.status(401).json(err)
    }
}

exports.getHotelsWithRooms = async (req, res) => {
    console.log("Inside getHotelsWithRooms controller");

    try {
        const adminId = req.adminId; 

        const hotelsList = await hotels.find({ adminId });

        if (!hotelsList.length) {
            return res.status(404).json({ message: "No hotels found for this admin" }); // ✅ Return after sending response
        }

        const hotelsWithRooms = await Promise.all(hotelsList.map(async (hotel) => {
            const hotelRooms = await rooms.find({ hotelId: hotel._id }); 
            return { ...hotel.toObject(), rooms: hotelRooms }; 
        }));
        
        res.status(200).json(hotelsWithRooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.deleteHotelController=async(req,res)=>{
    console.log("inside hotel delete ceontroller");
    
    const{_id}=req.body

    try{

        const deletedHotel=await hotels.findByIdAndDelete({_id})
       
        const deletedrooms=await rooms.deleteMany({hotelId:_id})
        if (!deletedHotel) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(deletedHotel)
    }
    catch(err){
        res.status(401).json(err)
    }
}

exports.getAllHotelController=async(req,res)=>{
    console.log("inide get all hotel controller");
    try {

        const allHotels=await hotels.find()
        if (!allHotels.length) {
            return res.status(404).json({ message: "No hotels added yet" }); 
        }

        const hotelsWithRooms = await Promise.all(allHotels.map(async (hotel) => {
            const hotelRooms = await rooms.find({ hotelId: hotel._id }); 
            return { ...hotel.toObject(), rooms: hotelRooms }; 
        }));
        
        res.status(200).json(hotelsWithRooms);

        
    } catch (error) {
        res.status(401).json(error)
    }
}
