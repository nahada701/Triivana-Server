const hotels = require("../models/hotelModel");
const rooms =require('../models/roomModel')

exports.addHotelController=async(req,res)=>{
    console.log("inside add hotel controller");
    
    try{
        const {  propertyname, propertytype,phone,email,minPrice,place,address,description,checkin,checkout,amenities}=req.body
        
        const images = req.files.map(file => file.filename)

        const adminId=req.adminId
        const exisistingHotel=await hotels.findOne({propertyname, propertytype,phone,email,address})

        if(exisistingHotel){
            res.status(406).json('hotel already added')
        }
        else{
            const newHotel = new hotels({propertyname,propertytype,phone,email,minPrice,place,address,description,checkin,checkout,amenities,images,reviews:[],rooms:[],adminId
        });
        await newHotel.save()

        res.status(200).json(newHotel)}

    }catch(err){
        res.status(500).json(err)
    }
}
exports.getHotelsWithRoomsOwners = async (req, res) => {
    console.log("Inside getHotelsWithRooms controller");

    try {
        const adminId = req.adminId; 

        // Populate both rooms and reviews
        const hotelsWithDetails = await hotels.find({ adminId })
            .populate("rooms")
            .populate({
                path: "reviews",
                populate: { path: "userId", select: "name email" } // Also get reviewer details
            });

        if (!hotelsWithDetails.length) {
            return res.status(404).json({ message: "No hotels found for this admin" });
        }

        res.status(200).json(hotelsWithDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getHotelsSuperAdmin = async (req, res) => {
    console.log("Inside getHotelsSuperAdmin controller");

    try {
    

        // Populate both rooms and reviews
        const hotelsWithDetails = await hotels.find().populate("rooms").populate({
                path: "reviews",
                populate: { path: "userId", select: "name email" } // Also get reviewer details
            }).populate({
                path:"adminId",
                select:"firstname lastname"
            });

        if (!hotelsWithDetails.length) {
            return res.status(404).json({ message: "No hotels found for this admin" });
        }

        res.status(200).json(hotelsWithDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getApprovedHotelsWithRoomsOwners = async (req, res) => {
    console.log("Inside getHotelsWithRooms controller");

    try {
        const adminId = req.adminId; 

        // Populate both rooms and reviews
        const hotelsWithDetails = await hotels.find({ adminId,status:"approved" })
            .populate("rooms")
            .populate({
                path: "reviews",
                populate: { path: "userId", select: "name email" } // Also get reviewer details
            });

        if (!hotelsWithDetails.length) {
            return res.status(404).json({ message: "No approved hotels found for this admin" });
        }

        res.status(200).json(hotelsWithDetails);
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
        res.status(500).json(err)
    }
}

exports.getSingleHotelController=async(req,res)=>{
    console.log("inside single hotel controller");

    const id=req.params.id
    try {
        
        const hotelDetails=await hotels.findById(id).populate("rooms").populate({
            path: "reviews",
            populate: { path: "userId", select: "name email" } // Also get reviewer details
        })

       
            res.status(200).json(hotelDetails)

        

    } catch (error) {
        res.status(500).json(error)
    }
    
}

exports.getAllApprovedHotelController=async(req,res)=>{
    console.log("inside get all hotel controller");
    try {

       const allHotelsWithDetails=await hotels.find({status:"approved"}).populate("rooms")
       .populate({
           path: "reviews",
           populate: { path: "userId", select: "name email" } // Also get reviewer details
       });
       if (!allHotelsWithDetails.length) {
        return res.status(404).json({ message: "No approved hotels found " });
    }

        res.status(200).json(allHotelsWithDetails);

        
    } catch (error) {
        res.status(500).json(error)
    }
}

exports.getHotelDetialsController=async(req,res)=>{
    console.log("Inside get hotelDetails controller");
    const {hotelId}=req.params
    try{

      const hotelDetails=await hotels.findById(hotelId)  
      res.status(200).json(hotelDetails)
    }
    catch(err){
        res.status(500).json(err)
    }
    
}
exports.editHotelController = async (req, res) => {
    try {
        const { hotelId } = req.params; // Extract hotel ID from params
        const { propertyname, propertytype, phone, email, address, place, minPrice, description, checkin, checkout, amenities, existingImages } = req.body;

        // Find the hotel by ID
        const hotel = await hotels.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        // Handle images: Keep old ones & add new ones
        const newImages = req.files.map(file => file.filename); // Uploaded images
        const updatedImages = [...(existingImages || []), ...newImages]; // Combine existing + new images

        // Update hotel details
        hotel.propertyname = propertyname;
        hotel.propertytype = propertytype;
        hotel.phone = phone;
        hotel.email = email;
        hotel.address = address;
        hotel.place = place;
        hotel.minPrice = minPrice;
        hotel.description = description;
        hotel.checkin = checkin;
        hotel.checkout = checkout;
        hotel.amenities = amenities ;
        hotel.status = "pending" ;
        hotel.images = updatedImages; // Updated images

        // Save updated hotel
        await hotel.save();

        res.status(200).json({ message: "Hotel updated successfully", hotel });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err });
    }
};


