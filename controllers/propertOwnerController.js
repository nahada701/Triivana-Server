const bookings=require("../models/bookingsModel")
const reviews=require("../models/reviewsModel")
const hotels=require("../models/hotelModel")
const rooms=require("../models/roomModel")

exports.propertyOwnerDashboardDataController = async (req, res) => {
    console.log("Inside get dashboard data controller");
    const adminId = req.adminId;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastThreeDays = new Date();
        lastThreeDays.setDate(lastThreeDays.getDate() - 3);
        lastThreeDays.setHours(0, 0, 0, 0);

        const lastThirtyDays = new Date();
        lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);
        lastThirtyDays.setHours(0, 0, 0, 0);

        // Step 1: Get all hotel IDs owned by the admin
        const hotelsData = await hotels.find({ adminId }).select("_id propertyname");
        const hotelIdArray = hotelsData.map(h => h._id);

        // Step 2: Get upcoming bookings for the next 5 days
        const upcomingBooking = await bookings.find({
            hotel: { $in: hotelIdArray },
            checkInDate: { $gte: today }
        })
        .populate("hotel", "propertyname")
        .populate("room", "roomType");

        // Step 3: Get reviews from the last 3 days
        const lastThreeDaysReviews = await reviews.find({
            hotelId: { $in: hotelIdArray },
            createdAt: { $gt: lastThreeDays },
            status: "approved"
        })
        .populate("userId", "name email")
        .populate("hotelId", "propertyname");

        // Step 4: Get last 30 days earnings
        const lastMonthEarnings = await bookings.aggregate([
            {
                $match: {
                    hotel: { $in: hotelIdArray },
                    checkInDate: { $gte: lastThirtyDays },
                    status: "confirmed"
                }
            },
            {
                $group: {
                    _id: null,
                    lastthirtydayEarnings: { $sum: "$totalprice" }
                }
            }
        ]);

        // Step 5: Get all-time earnings
        const allTimeEarnings = await bookings.aggregate([
            {
                $match: {
                    hotel: { $in: hotelIdArray },
                    status: "confirmed"
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$totalprice" }
                }
            }
        ]);

        // Step 6: Get available rooms grouped by hotel and room type
        const hotelIdObject = await hotels.find({ adminId }).select("_id propertyname");
        const hotelIdsArray = hotelIdObject.map(hotel => hotel._id);
        const hotelNameMap = Object.fromEntries(hotelIdObject.map(hotel => [hotel._id.toString(), hotel.propertyname]));

        // Get all rooms in admin's hotels
        const allRooms = await rooms.find({ hotelId: { $in: hotelIdsArray } });

        // Get bookings for today
        const bookedRooms = await bookings.aggregate([
            {
                $match: {
                    hotel: { $in: hotelIdsArray },
                    checkInDate: { $lte: today },
                    checkOutDate: { $gt: today }
                }
            },
            {
                $group: {
                    _id: "$room",
                    bookedCount: { $sum: 1 }
                }
            }
        ]);

        // Convert booked rooms to a map for quick lookup
        const bookedRoomsMap = Object.fromEntries(bookedRooms.map(b => [b._id.toString(), b.bookedCount]));

        // Calculate available rooms for each hotel and room type
        const availableRooms = {};

        allRooms.forEach(room => {
            const hotelName = hotelNameMap[room.hotelId.toString()];
            const roomType = room.roomType;
            const totalRooms = room.numberOfRooms;
            const bookedCount = bookedRoomsMap[room._id.toString()] || 0;
            const availableCount = totalRooms - bookedCount;

            if (!availableRooms[hotelName]) {
                availableRooms[hotelName] = {};
            }
            availableRooms[hotelName][roomType] = availableCount;
        });
    
        const responseArray = Object.entries(availableRooms).map(([hotel, rooms]) => ({
            hotel,
            rooms
        }));
        
        // Step 10: Send response
        res.status(200).json({
            upcomingBookingCount: upcomingBooking.length,
            lastThreeDaysReviewsCount: lastThreeDaysReviews.length,
            lastMonthEarnings: lastMonthEarnings[0]?.lastthirtydayEarnings || 0,
            allTimeEarnings: allTimeEarnings[0]?.totalEarnings || 0,
             availableRooms:responseArray
        });

    } catch (err) {
        console.error("Error in dashboard data:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
