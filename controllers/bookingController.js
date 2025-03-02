const bookings=require("../models/bookingsModel")
const rooms=require("../models/roomModel")

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
    const {hotelId,roomId}=req.params
    const userId=req.userId
    const{ name, email, phone, request,checkInDate, checkOutDate, numberOfRooms, numberOfAdults, numberOfChildrens}=req.body   

    try {
        const newBooking=new bookings({hotelId,roomId,userId,name, email, phone, request,checkInDate, checkOutDate, numberOfRooms, numberOfAdults, numberOfChildrens})
        await newBooking.save()
        res.status(200).json(newBooking)
    } catch (error) {
        res.status(401).json(error)
    }

}