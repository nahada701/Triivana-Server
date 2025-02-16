const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    hotelId: { 
        type: mongoose.Schema.Types.ObjectId, ref: "hotels",
        required: true
     },
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users", 
        required: true 
        },
    rating: {
        type: Number,
        required: true, 
        min: 1,
        max: 5 }, // Rating out of 5
    comment: { 
        type: String, 
        required: true },
    createdAt: { 
        type: Date, 
        default: Date.now }
});

const reviews = mongoose.model("reviews", reviewSchema);
module.exports = reviews;
