const express=require('express')
const  userController  = require('../controllers/userController')
const adminController =require('../controllers/adminController')
const jwtmiddlewareAdmin = require('../middlewares/jwtMiddlewareAdmin')
const multerMiddleware = require('../middlewares/multerMiddleware')
const { addHotelController, getHotelsWithRoomsOwners, deleteHotelController, getSingleHotelController, getAllApprovedHotelController, getApprovedHotelsWithRoomsOwners, getHotelsSuperAdmin, editHotelController, getHotelDetialsController } = require('../controllers/hotelController')
const { addRoomsController, getRoomDetailsController, deleteRoomController, getRoomByRoomIdController, editRoomsController } = require('../controllers/roomsControler')
const jwtmiddlewareUser = require('../middlewares/jwtMiddlewareUser')
const { addReviewController, getAllReviews, updateReviews } = require('../controllers/reviewController')
const { superAdminLoginController, getAllPropertyOwners, updateHotelStatusController, dashboardContentSuperAdminController } = require('../controllers/superAdminController')
const jwtMiddlewareSuperAdmin = require('../middlewares/jwtMiddlewareSuperAdmin')
const { checkRoomAvailabilityController, newBookingController, sendConfirmationEmail, getUserBookingsController, cancelBookingController, getUserBookingByParams } = require('../controllers/bookingController')
const { propertyOwnerDashboardDataController, propertyOwnerNewBookingsController, sendCancellationMailByPropertyOwner, updatePaymentController, settleBalancePaymentController, bookingHistoryController, propertyReviewsController, propertyOwnerEarningsController } = require('../controllers/propertOwnerController')
const { googleAuthController } = require('../controllers/authController')

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

router.post("/newbooking/:hotel/:room",jwtmiddlewareUser,newBookingController)

// send emai 

router.post('/booking-confirmation-email',jwtmiddlewareUser,sendConfirmationEmail)

// save property

router.put('/save-property',jwtmiddlewareUser,userController.addSavePropertiesController)

// get user saved properties

router.get('/user/saved-properties',jwtmiddlewareUser,userController.getSavedPropertiesController)

// remove saved property

router.delete('/remove/hotel/:hotelId',jwtmiddlewareUser,userController.removeSavedPropertyController)

// get user booking

router.get('/get-user-bookings',jwtmiddlewareUser,getUserBookingsController)

router.put('/cancel-booking/:bookingId',jwtmiddlewareUser,cancelBookingController)

router.get("/super-admin-dashboard",jwtMiddlewareSuperAdmin,dashboardContentSuperAdminController)

router.get('/get-all-users',jwtMiddlewareSuperAdmin,userController.getAllUserController)

router.get('/user/booking/:userId',jwtMiddlewareSuperAdmin,getUserBookingByParams)

router.post('/banuser',jwtMiddlewareSuperAdmin,userController.banUserController)


router.put('/unban/user/:userId',jwtMiddlewareSuperAdmin,userController.unBanUserController)


router.get('/propery-owner/dashboard',jwtmiddlewareAdmin,propertyOwnerDashboardDataController)

router.get("/property-owner-upcoming-bookings",jwtmiddlewareAdmin,propertyOwnerNewBookingsController)

router.post("/cancellation-mail",jwtmiddlewareAdmin,sendCancellationMailByPropertyOwner)

router.put('/update-payment/:id',jwtmiddlewareAdmin,updatePaymentController)

router.put("/settle-payment/:id",jwtmiddlewareAdmin,settleBalancePaymentController)

router.get("/admin-booking-history",jwtmiddlewareAdmin,bookingHistoryController)

router.get("/reviews-admin",jwtmiddlewareAdmin,propertyReviewsController)

router.post("/google-auth", googleAuthController);

router.get("/earnings-admin",jwtmiddlewareAdmin,propertyOwnerEarningsController)

router.get("/hoteldetails/:hotelId",jwtmiddlewareAdmin,getHotelDetialsController)

router.put('/edit-property/:hotelId',jwtmiddlewareAdmin,multerMiddleware.array("newImages"),editHotelController)

router.get("/room-details/:roomId",jwtmiddlewareAdmin,getRoomByRoomIdController)

router.put('/edit-room/:roomId',jwtmiddlewareAdmin,multerMiddleware.array("newImages"),editRoomsController)


module.exports=router