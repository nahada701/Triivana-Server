const bookings=require("../models/bookingsModel")
const reviews=require("../models/reviewsModel")
const hotels=require("../models/hotelModel")
const rooms=require("../models/roomModel")
const nodemailer=require("nodemailer")
const path = require("path");
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

exports.propertyOwnerNewBookingsController = async (req, res) => {
    console.log("Inside new booking controller");
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to 00:00:00

    const adminId = req.adminId;
    
    try {
        const hotelIdObject = await hotels.find({ adminId }).select("_id");
        const hotelIdArray = hotelIdObject.map(h => h._id);
        
        const bookingsData = await bookings.aggregate([
            {
                $match: {
                    hotel: { $in: hotelIdArray },
                    checkInDate: { $gte: today } // Ensure date comparison works correctly
                }
            },
            { $sort: { checkInDate: 1 } }, // Sort by check-in date

            // Join with "hotels" collection to get hotel name
            {
                $lookup: {
                    from: "hotels",
                    localField: "hotel",
                    foreignField: "_id",
                    as: "hotelDetails"
                }
            },
            { $unwind: "$hotelDetails" }, // Convert array to object

            // Join with "rooms" collection to get room type
            {
                $lookup: {
                    from: "rooms",
                    localField: "room",
                    foreignField: "_id",
                    as: "roomDetails"
                }
            },
            { $unwind: "$roomDetails" }, // Convert array to object

            // Select only the required fields
            {
                $project: {
                    _id: 1,
                    checkInDate: 1,
                    checkOutDate: 1,
                    totalprice: 1,
                    status: 1,
                    numberOfRooms: 1,
                    hotelName: "$hotelDetails.propertyname",
                    roomType: "$roomDetails.roomType",
                    name: 1,
                    request: 1,
                    email: 1,
                    phone: 1,
                    paymentDate: 1,
                    paymentMade: 1,
                    paymentMethod: 1,
                    paymentStatus: 1
                }
            }
        ]);

        res.status(200).json(bookingsData);
    } catch (err) {
        console.error("Error in propertyOwnerNewBookingsController:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.sendCancellationMailByPropertyOwner=async(req,res)=>{
    console.log("Inside cancellation mail by propertyOwner");
    const{name,email,reason,propertyname,checkInDate,checkOutDate}=req.body
    
    const start=new Date(checkInDate).toLocaleDateString()
    const end=new Date(checkOutDate).toLocaleDateString()


 
     const transporter=nodemailer.createTransport({
         service:"Gmail",
         auth:{
             user:process.env.EMAIL_USER,
             pass:process.env.EMAIL_PASS
         }
     })
     transporter.verify((error, success) => {
         if (error) {
             console.log("Error connecting to email server:", error);
         } else {
             console.log("Server is ready to send emails.");
         }
     });
    const mailOptions={
        from:process.env.USER_EMAIL,
        to:email,
        subject:`Booking Cancelled at ${propertyname}`,
        html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <div style="text-align: center;background-color:black">
              <img src="cid:logoImage"  alt="Triivana Logo" style="width: 150px; margin-bottom: 10px;">
          </div>
          <h2 style="color: #2c3e50; text-align: center;">Your Booking is Cancelled!</h2>
          <h3 style="color: #555; text-align: center;">Dear <strong>${name}</strong>,</h3>
          <h3 style="color: #555;">We are regreted to cancel your stay at <strong>${propertyname}</strong> due to "${reason}". Below are your canceled booking's dates:</h3>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            
              <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-in Date</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${start}</td>
              </tr>
              <tr>
                  <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-out Date</strong></td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${end}</td>
              </tr>
         
          </table>

          <p style="color: #555;">If you have any special queries, feel free to contact us.</p>
          
          <div style="text-align: center; margin-top: 20px;">
              <a href="https://triivana.com" style="background-color: #2c3e50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
          </div>
          
          <hr style="margin: 20px 0;">
          <p style="font-size: 12px; text-align: center; color: #777;">
              This is an automated email, please do not reply. If you have any questions, contact our support team at 
              <a href="mailto:support@triivana.com" style="color: #2c3e50;">support@your-hotel-app.com</a>.
          </p>
      </div>
      `,
      attachments: [
        {
            filename: "logoT.png", // The name that will be shown in the email
            path: path.join(__dirname, "../uploads/logoT.png"), // Path to the file
            cid: "logoImage", // Content-ID to reference in the email
        },
    ],
    }


    try{
        await transporter.sendMail(mailOptions)
        res.status(200).json("Send Email Successfully")
    }
    catch(error){
        res.status(500).json("Internal server error"+ error)
    }


    
}

exports.updatePaymentController=async(req,res)=>{

    console.log("inisde update payment controller");
    const {id}=req.params
    const{paymentMade,paymentMethod,amountToBePaid}=req.body
    const today=new Date()

    try{
      if(paymentMade>=amountToBePaid){
        paymentStatus="paid"
      }
      else{
        paymentStatus="partial"
      }
        const updatedBooking=await bookings.findByIdAndUpdate(id,{
            $set:{
                paymentMade,
                paymentMethod,
                paymentDate:today,
                paymentStatus
            } 
        },
        {new:true}
    )
    if(!updatedBooking){
       return res.status(404).json("Booking not found")
    }
        res.status(200).json(updatedBooking)
    }catch(err){
        res.status(500).json(err)
    }
    
}

exports.settleBalancePaymentController = async (req, res) => {
    console.log("Inside update payment controller");
    const { id } = req.params;

    try {
        // Fetch the booking first
        const existingBooking = await bookings.findById(id);
        if (!existingBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Extract total price
        const amountToBePaid = existingBooking.totalprice;

        // Update booking payment status
        const updatedBooking = await bookings.findByIdAndUpdate(
            id,
            {
                $set: {
                    paymentMade: amountToBePaid,
                    paymentStatus: "paid"
                }
            },
            { new: true }
        );

        res.status(200).json(updatedBooking);
    } catch (err) {
        console.error("Error in updating payment:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};


exports.bookingHistoryController = async (req, res) => {
    console.log("Inside booking history controller");

    const adminId = req.adminId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const hotelObjects = await hotels.find({adminId}).select("_id");
        const hotelArray = hotelObjects.map(hotel => hotel._id);

        const bookingHistory = await bookings.aggregate([
            {
                $match: {
                    hotel: { $in: hotelArray },
                    checkOutDate: {$lte: today }
                }
            },  
            {
                $sort:{checkInDate:1}
            },
            {
                $lookup: {
                    from: "hotels",
                    localField: "hotel",
                    foreignField: "_id",
                    as: "hotelDetails"
                }
            },
            { $unwind: "$hotelDetails" },
            {
                $lookup: {
                    from: "rooms",
                    localField: "room",
                    foreignField: "_id",
                    as: "roomDetails" // Fixed typo
                }
            },
            { $unwind: "$roomDetails" },
          
            {
                $project: {
                    name: 1,
                    email: 1,
                    phone: 1,
                    checkInDate: 1,
                    checkOutDate: 1,
                    status: 1,
                    paymentMade: 1,
                    totalprice: 1,
                    propertyname: "$hotelDetails.propertyname",
                    roomType: "$roomDetails.roomType" // Fixed typo
                }
            }
        ]);

        res.status(200).json(bookingHistory);
    } catch (err) {
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};



exports.propertyReviewsController = async (req, res) => {
    console.log("Inside property owner review list controller");

    const adminId = req.adminId;

    try {
        // Step 1: Fetch hotels owned by the admin
        const hotelLists = await hotels.find({ adminId }).select("_id");
        const hotelArray = hotelLists.map(hotel => hotel._id); // Convert to ObjectId

        // Step 2: Aggregate Reviews
        const reviewsLists = await reviews.aggregate([  
            {
                $match: {
                    hotelId: { $in: hotelArray },
                    status: "approved"
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$hotelId",
                    reviews: { $push: "$$ROOT" },
                    averageRating: { $avg: "$rating" }
                }
            },
            {
                $lookup: {
                    from: "hotels",
                    localField: "_id",
                    foreignField: "_id",
                    as: "hotelDetails"
                }
            },
            {
                $unwind: "$hotelDetails"
            },
            {
                $unwind: "$reviews" // Unwind reviews so we can fetch user details
            },
            {
                $lookup: {
                    from: "users",
                    localField: "reviews.userId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails" // Each review now has user details
            },
            {
                $group: {
                    _id: "$_id",
                    propertyname: { $first: "$hotelDetails.propertyname" },
                    averageRating: { $first: "$averageRating" },
                    reviews: {
                        $push: {
                            _id: "$reviews._id",
                            userId: "$reviews.userId",
                            userName: "$userDetails.name", // Include user name
                            rating: "$reviews.rating",
                            comment: "$reviews.comment",
                            createdAt: "$reviews.createdAt"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    hotelId: "$_id",
                    propertyname: 1,
                    averageRating: { $round: ["$averageRating", 1] }, // Round to 1 decimal
                    reviews: 1
                }
            }
        ]); // <-- C
        res.status(200).json(reviewsLists);
    } catch (error) {
        console.error("Error in propertyReviewsController:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

