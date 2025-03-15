//controller require models ie.database 

const hotels = require('../models/hotelModel');

const users=require('../models/userModel')
const jwt=require('jsonwebtoken')
const Otp=require('../models/OTPModel')

exports.userRegisterController = async (req, res) => {
    console.log("Inside user registration controller");
  
    const { name, email, password, otp } = req.body; // Extract OTP from request
  
    try {
      // Step 1: Verify OTP
      const otpRecord = await Otp.findOne({ email, otp });
      if (!otpRecord) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }
  
      // Step 2: Check if user already exists
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return res.status(406).json({ error: "User already exists" });
      }
  
      // Step 3: OTP is valid and user does not exist → Delete OTP record
      await Otp.deleteOne({ email });
  
      // Step 4: Create new user
      const newUser = new users({ name, email, password, savedProperties: [] });
      await newUser.save();
  
      return res.status(200).json({ message: "User registered successfully", user: newUser });
  
    } catch (err) {
      console.error("Error in user registration:", err);
      return res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
  };
  

exports.userLoginController = async (req, res) => {
    console.log("Inside user login controller");

    try {
        const { email, password } = req.body;

        // Find user by email and password
        const existingUser = await users.findOne({ email, password });

        // Handle case where user is not found
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is banned
        if (existingUser.isBanned) {
            if (existingUser.bannedUntil && new Date() < existingUser.bannedUntil) {
                return res.status(403).json({message:`You are temporarily banned until ${existingUser?.bannedUntil.toLocaleDateString()} due to ${existingUser.banReason}` });
            }
        }
        
        

        // Ensure JWT secret is set
        if (!process.env.JWT_PASSWORD) {
            console.error("JWT_PASSWORD is not defined in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_PASSWORD,
            { expiresIn: "1d" }
        );

        res.status(200).json({ user: existingUser, token });

    } catch (err) {
        console.error("Error in userLoginController:", err); // Log for debugging
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
};


exports.addSavePropertiesController=async(req,res)=>{
    console.log("inide save properties controller");
  try { 
    const userId=req.userId
   const {hotelId}=req.body
   console.log(userId,hotelId);
   
    const existingUserData=await users.findById(userId)
    if (!existingUserData) {
        return res.status(404).json({ error: "User not found" });
    }

    // Properly check if the property is already saved
    const isAlreadySaved = existingUserData.savedProperties.some(
        (hotId) => hotId.toString() === hotelId
    );

    if (isAlreadySaved) {
        return res.status(406).json({ error: "Hotel already added" });
    }
    existingUserData.savedProperties.push(hotelId)
    await existingUserData.save()
    console.log(existingUserData);
    
    res.status(200).json(existingUserData)
}
    catch(err){
        res.status(500).json(err)
    }
    
}

exports.getSavedPropertiesController=async(req,res)=>{
    console.log("inide get all saved propery controlller");

    const userId=req.userId
    try{
        const user=await users.find({_id:userId}).populate("savedProperties")
        res.status(200).json(user)
    }catch(err){
        res.status(500).json(err)
    }
    
}
exports.removeSavedPropertyController = async (req, res) => {
    console.log("Inside remove saved property controller");

    try {
        const userId = req.userId; // Get user ID from auth middleware
        const { hotelId } = req.params; // Get hotel ID from request params

        const updatedUser = await users.findOneAndUpdate(
            { _id: userId }, // Find the user
            { $pull: { savedProperties: hotelId } }, // Remove hotelId from savedProperties
            { new: true } // Return updated user data
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Hotel removed from saved properties", savedProperties: updatedUser.savedProperties });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getAllUserController=async(req,res)=>{
    console.log("inside all users controller");

    try{

        const allUsers=await users.find()
        res.status(200).json(allUsers)
    }
    catch(err){
        res.status(500).json(err)
    }
    
}

exports.banUserController = async (req, res) => {
    console.log("Inside banUser controller");

    const { userId, banReason, numberOfBanDays } = req.body;

    try {
       
        const bannedUntil = new Date();
        bannedUntil.setDate(bannedUntil.getDate() + numberOfBanDays);

        
        // Update user document
        const banningUser = await users.updateOne(
            { _id: userId },
            { $set: { banReason, isBanned: true, bannedUntil } }
        );

        if (banningUser.modifiedCount === 0) {
            return res.status(404).json({ message: "User not found or already banned." });
        }

        res.status(200).json({ message: "User banned successfully.", banningUser });
    } catch (err) {
        console.error("Error banning user:", err);
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
};

exports.unBanUserController = async (req, res) => {
    console.log("Inside unban User controller");

    const {userId} = req.params;

    try {
        const unbanningUser = await users.updateOne(
            { _id: userId },
            { $set: { banReason:null , isBanned: false, bannedUntil:null } }
        );

        if (unbanningUser.modifiedCount === 0) {
            return res.status(404).json({ message: "User not found or already unbaned." });
        }

        res.status(200).json({ message: "User unbaned successfully.", unbanningUser });
    } catch (err) {
        console.error("Error un banning user:", err);
        res.status(500).json({ message: "Internal Server Error", error: err });
    }
};