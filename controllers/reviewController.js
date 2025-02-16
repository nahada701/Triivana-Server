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
