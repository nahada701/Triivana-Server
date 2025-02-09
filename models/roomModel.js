const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotels',
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    numberOfRooms: {
        type: Number,
        required: true
    },
    pricePerNight: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amenities:[{
        type:String,
    }],
    images:[{
        type:String,
        required:true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const rooms = mongoose.model('rooms', roomSchema);
module.exports = rooms;
