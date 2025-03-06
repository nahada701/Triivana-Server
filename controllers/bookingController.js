const bookings=require("../models/bookingsModel")
const rooms=require("../models/roomModel")
const nodemailer = require("nodemailer");
require("dotenv").config();

exports.checkRoomAvailabilityController=async(req,res)=>{
    console.log("Inside check availability controller");
    try {
        
        const{checkInDate,checkOutDate,numberOfRooms,roomId}=req.body
        const start=new Date(checkInDate)
        const end=new Date(checkOutDate)

        const existingBookings=await bookings.find({
            roomId,
            $and:[
                {checkInDate:{$lt:end},checkOutDate:{$gt:start}}
            ]
        })

        const roomBooking=await rooms.findOne({_id:roomId})
        const totalNumberOfRooms=roomBooking.numberOfRooms

       const totalRoomsBooked= existingBookings.reduce((acc,bookings)=>acc+bookings.numberOfRooms,0)
       const availableRooms=totalNumberOfRooms-totalRoomsBooked

     
        res.status(200).json(availableRooms)
      

    } catch (error) {
        res.status(401).json(error)
    }

    
}


exports.newBookingController=async(req,res)=>{
    console.log("Inside room booking controller");
    const {hotel,room}=req.params
    const userId=req.userId

    const{ name, email, phone, request,checkInDate, checkOutDate, numberOfRooms, numberOfAdults, numberOfChildrens,totalprice}=req.body   

    try {
        
        if(await bookings.findOne({hotel,room,userId,name, email, phone, request,checkInDate:new Date(checkInDate), checkOutDate:new Date(checkOutDate), numberOfRooms, numberOfAdults, numberOfChildrens,totalprice})){
            return res.status(406).json("Already booked")
        }
        const newBooking=new bookings({hotel,room,userId,name, email, phone, request,checkInDate:new Date(checkInDate), checkOutDate:new Date(checkOutDate), numberOfRooms, numberOfAdults, numberOfChildrens,totalprice})
        await newBooking.save()
        res.status(200).json(newBooking)
    } catch (error) {
        res.status(401).json(error)
    }

}


exports.sendConfirmationEmail=async(req,res)=>{
    console.log("Inside send email controller");
    const{name,email,checkInDate, checkOutDate, numberOfRooms,numberOfAdults,numberOfChildrens,propertyname,roomType}=req.body

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
        subject:"Booking confirmation",
        html:`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <div style="text-align: center;background-color:black">
                    <img  src="https://i.postimg.cc/nzW2yrmM/logoT.png" alt="Triivana Logo" style="width: 150px; margin-bottom: 10px;">
                </div>
                <h2 style="color: #2c3e50; text-align: center;">Your Booking is Confirmed! 🎉</h2>
                <h3 style="color: #555; text-align: center;">Dear <strong>${name}</strong>,</h3>
                <h3 style="color: #555;">We are delighted to confirm your stay at <strong>${propertyname}</strong>. Below are your booking details:</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Room Type</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${roomType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-in Date</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${start}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-out Date</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${end}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Number of Rooms</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">${numberOfRooms}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Guests</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">
                            ${numberOfAdults} Adults, ${numberOfChildrens} Children
                        </td>
                    </tr>
                </table>

                <p style="color: #555;">We are looking forward to welcoming you! If you have any special requests, feel free to contact us.</p>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://triivana.com" style="background-color: #2c3e50; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit Our Website</a>
                </div>
                
                <hr style="margin: 20px 0;">
                <p style="font-size: 12px; text-align: center; color: #777;">
                    This is an automated email, please do not reply. If you have any questions, contact our support team at 
                    <a href="mailto:support@triivana.com" style="color: #2c3e50;">support@your-hotel-app.com</a>.
                </p>
            </div>
            `
    }

    try{
        await transporter.sendMail(mailOptions);
        res.status(200).json("Email end succesfully")
    }
    catch(err){
        res.status(401).json(err)
        
    }
}

exports.getUserBookingsController=async(req,res)=>{
    console.log("Get user booking controller");
    const userId=req.userId
    try{
        const userBookingList=await bookings.find({userId}).populate("hotel","propertyname images").populate("room","roomType")
        res.status(200).json(userBookingList)
    }
    catch(err){
        res.status(401).json(err)
    }
}

exports.cancelBookingController=async(req,res)=>{
    console.log("Inside cancel booking controller");
    const {bookingId}=req.params
    try{
        const existingBooking=await bookings.findById({_id:bookingId})
        if(existingBooking){
            existingBooking.status='canceled'
            existingBooking.save()
            res.status(200).json(existingBooking)
        }
        else{
            res.status(404).json("no booking found")
        }

    }
    catch(err){
        res.status(401).json(err)
    }
    
}

