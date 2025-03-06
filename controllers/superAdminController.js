const superadmins = require("../models/superadminModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const admins=require('../models/adminModel')
const hotels=require('../models/hotelModel');
const users = require("../models/userModel");
const bookings = require("../models/bookingsModel");


exports.superAdminLoginController = async (req, res) => {
  console.log("Inside Super Admin login controller");

  
  const { email, password } = req.body;

  try {
    // Check if the super admin exists
    const existingSuperAdmin = await superadmins.findOne({ email });

    if (!existingSuperAdmin) {
      return res.status(404).json("Super Admin not found");
    }

    // Compare entered password with the hashed password stored in DB
    const isMatch = await bcrypt.compare(password, existingSuperAdmin.password);

    if (!isMatch) {
      return res.status(400).json("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
      { superAdminId: existingSuperAdmin._id },
      process.env.JWT_PASSWORD,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json(err);
  }
};

//get all property Owners controller

exports.getAllPropertyOwners=async(req,res)=>{

  console.log("inside get all propery owners controller");
try{

  const allPropertyOwners=await admins.find().lean()

  if(allPropertyOwners.length==0){
   return res.status(404).json("No propertyowners found")
  }

  for(let owner of allPropertyOwners){

    const approvedHotels=await hotels.find({adminId:owner._id,status:"approved"}).lean()
    owner.approvedHotels=approvedHotels

  }

  res.status(200).json(allPropertyOwners)

}catch(err){
  res.status(401).json(err)
}
  

}

exports.updateHotelStatusController=async(req,res)=>{
  console.log("inide update hotel status controller");
 
  const {id,status}=req.body

  if(!status=="approved"| !status=="rejected"){
    return  res.status(400).json("Invalid status")
  }

  const updatedHotel=await hotels.findByIdAndUpdate(id,{status},{new:true})
  if (!updatedHotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
  }
  res.status(200).json(updatedHotel);

}
exports.dashboardContentSuperAdminController=async(req,res)=>{
  console.log("inside get dashboard super admin Controller ");

  try{
    const oneYearAgo=new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear-1)
    oneYearAgo.setDate(1)
    const totalUserCount=await users.countDocuments()
    const totalBookings=await bookings.countDocuments()
    const totalProperties=await hotels.countDocuments()
    
    const monthlyNewUserData=await users.aggregate([
      {
       $match:{createdAt:{$gte:oneYearAgo}}
      },
      {
       $group:{
        _id:{$dateToString:{format:'%Y-%m',date:"$createdAt"}},
        count:{$sum:1},
         }
       },
      {
        $sort:{_id:1}
      }
    ])

    const monthlyBookingData=await bookings.aggregate([
      {
        $match:{createdAt:{$gte:oneYearAgo}}
      },
      {
        $group:{
          _id:{$dateToString:{format:'%Y-%m',date:"$createdAt"}},
          count:{$sum:1}
        }
      },
      {
        $sort:{_id:1}
      }
    ])

    const propertyTypesData=await hotels.aggregate([
      {
        $match:{status:'approved'}
      },
      {
        $group:{
          _id:"$propertytype",
          count:{$sum:1}
        }
      }
    ])

    const allusers = await users.find({ createdAt: { $type: "string" } });

    for (const user of allusers) {
        await users.updateOne(
            { _id: user._id },
            { $set: { createdAt: new Date(user.createdAt) } }
        );
        console.log(`Updated user: ${user._id}`);
    }

    res.status(200).json({propertyTypesData,monthlyBookingData,monthlyNewUserData,totalProperties,totalBookings,totalUserCount})
  }
  catch(err){
    res.status(401).json(err)
  }
}