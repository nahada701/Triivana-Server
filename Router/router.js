const express=require('express')
const  userController  = require('../controllers/userController')
const adminController =require('../controllers/adminController')
const jwtmiddlewareAdmin = require('../middlewares/jwtMiddlewareAdmin')
const multerMiddleware = require('../middlewares/multerMiddleware')
const { addHotelController, getHotelsWithRooms, deleteHotelController, getAllHotelController, getSingleHotelController } = require('../controllers/hotelController')
const { addRoomsController, getRoomDetailsController, deleteRoomController } = require('../controllers/roomsControler')
const jwtmiddlewareUser = require('../middlewares/jwtMiddlewareUser')
const { addReviewController } = require('../controllers/reviewController')
const { superAdminLoginController } = require('../controllers/superAdminController')

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

//get hotels with room

router.get("/get-admin-hotelsdetails",jwtmiddlewareAdmin,getHotelsWithRooms)

//delete hotel

router.delete("/delete-hotel",jwtmiddlewareAdmin,deleteHotelController)

//get rooms with hotel id

router.post('/get-rooms-with-hotelId',jwtmiddlewareAdmin,getRoomDetailsController)

//delete room

router.delete('/delete-room',jwtmiddlewareAdmin,deleteRoomController)

//get all hotels

router.get("/get-all-hotels",getAllHotelController)

//add review controller

router.post("/add-review",jwtmiddlewareUser,addReviewController)

//get single hotel data

router.get("/get-single-hotel/:id",getSingleHotelController)

//superadmin login

router.post("/super-admin-login", superAdminLoginController);
module.exports=router