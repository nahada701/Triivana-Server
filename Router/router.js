const express=require('express')
const  userController  = require('../controllers/userController')
const adminController =require('../controllers/adminController')
const jwtmiddlewareAdmin = require('../middlewares/jwtMiddlewareAdmin')
const multerMiddleware = require('../middlewares/multerMiddleware')
const { addHotelController, getHotelsWithRoomsOwners, deleteHotelController, getSingleHotelController, getAllApprovedHotelController, getApprovedHotelsWithRoomsOwners, getHotelsSuperAdmin } = require('../controllers/hotelController')
const { addRoomsController, getRoomDetailsController, deleteRoomController } = require('../controllers/roomsControler')
const jwtmiddlewareUser = require('../middlewares/jwtMiddlewareUser')
const { addReviewController, getAllReviews, updateReviews } = require('../controllers/reviewController')
const { superAdminLoginController, getAllPropertyOwners, updateHotelStatusController } = require('../controllers/superAdminController')
const jwtMiddlewareSuperAdmin = require('../middlewares/jwtMiddlewareSuperAdmin')
const { checkRoomAvailabilityController, newBookingController } = require('../controllers/bookingController')

const router=new express.Router()

//user resgistration

router.post("/register-user",userController.userRegisterController)

//user login

router.post("/login-user",userController.userLoginController)
//admin registration

router.post("/admin-register",adminController.adminRegisterController)

//admin login

router.post("/admin-login",adminController.adminLoginController)

//add hotel

router.post("/addhotel",jwtmiddlewareAdmin,multerMiddleware.array("images"),addHotelController)

//add room

router.post("/addrooms",jwtmiddlewareAdmin,multerMiddleware.array("images"),addRoomsController)

//get all hotels with room owner

router.get("/get-owner-hotelsdetails",jwtmiddlewareAdmin,getHotelsWithRoomsOwners)

//get all approved hotels with room owner

router.get("/get-owner-approved-hotelsdetails",jwtmiddlewareAdmin,getApprovedHotelsWithRoomsOwners)


//delete hotel by owner

router.delete("/delete-hotel",jwtmiddlewareAdmin,deleteHotelController)

//get rooms with hotel id

router.post('/get-rooms-with-hotelId',jwtmiddlewareAdmin,getRoomDetailsController)

//delete room

router.delete('/delete-room',jwtmiddlewareAdmin,deleteRoomController)

//get all hotels to show on home

router.get("/get-all-hotels",getAllApprovedHotelController)

//add review controller

router.post("/add-review",jwtmiddlewareUser,addReviewController)

//get single hotel data

router.get("/get-single-hotel/:id",getSingleHotelController)

//superadmin login

router.post("/super-admin-login", superAdminLoginController);
//get all hotels superAdmin

router.get("/all-hotels-super-admin",jwtMiddlewareSuperAdmin,getHotelsSuperAdmin)
//getAllPropertyOwners

router.get("/get-all-propertyowners",jwtMiddlewareSuperAdmin,getAllPropertyOwners)

//get all review 

router.get("/get-all-reviews",jwtMiddlewareSuperAdmin,getAllReviews)

// update review

router.put("/update-review",jwtMiddlewareSuperAdmin,updateReviews)

//update hotel status

router.put("/update-hotel-status",jwtMiddlewareSuperAdmin,updateHotelStatusController)

//check room availability

router.post("/check-room-availability",jwtmiddlewareUser,checkRoomAvailabilityController)

//new boooking

router.post("/newbooking/:hotelId/:roomId",jwtmiddlewareUser,newBookingController)

module.exports=router