const reviews = require("../models/reviewsModel");
const hotels = require("../models/hotelModel");

exports.addReviewController = async (req, res) => {
    console.log("inside add review controller");

    try {
        const { hotelId, rating, comment } = req.body;
        const userId = req.userId; // Assuming user is authenticated

        // Check if the hotel exists
        const hotelExists = await hotels.findById(hotelId);
        if (!hotelExists) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        // Create a new review
        const newReview = new reviews({ hotelId, userId, rating, comment });
        const savedReview = await newReview.save();

        // Update hotel to include this review
        await hotels.findByIdAndUpdate(hotelId, { $push: { reviews: savedReview._id } });

        res.status(200).json(savedReview);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getAllReviews=async(req,res)=>{
    console.log("inside get all reviews controller");
    try {
        const allReviews = await reviews.find()
        .populate({ path: "hotelId", select: "propertyname" })  // ✅ Correct field name
        .populate({ path: "userId", select: "name" });
        res.status(200).json(allReviews)     

    } catch (error) {
        res.status(500).json(error)
        
    }
    
}

//update review status

exports.updateReviews=async(req,res)=>{
    console.log("inide update review controller");

    try{const {id,status}=req.body
    console.log(id,status)
    if(!status=="approved"| !status=="rejected"){
      return  res.status(400).json("Invalid status")
    }

    const updatedReview=await reviews.findByIdAndUpdate(id,{status},{new:true})
    if (!updatedReview) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }
    res.status(200).json(updatedReview);}
    catch(err){
        res.status(500).json(err)
    }
    
}
