//controller require models ie.database 

const hotels = require('../models/hotelModel');

const users=require('../models/userModel')
const jwt=require('jsonwebtoken')


exports.userRegisterController=async(req,res)=>{
console.log('inside user registration controller');
 
const{name,email,password}=req.body
try{
    const existingUser=await users.findOne({email})
    if(existingUser){
        res.status(406).json("user already exists")

    }
    else{
        const newUser=new users({name,email,password,savedProperties:[]})
        await newUser.save()
        res.status(200).json(newUser)
    }

}catch(err){
    res.status(500).json(err)
}


}

exports.userLoginController=async(req,res)=>{
    console.log("inside user login controller");
    try{
       
         const {email,password}=req.body
         const existingUser=await users.findOne({email,password})
         if (existingUser.isBanned) {
            if (existingUser.bannedUntil && new Date() < existingUser.bannedUntil) {
                return res.status(403).json({ 
                    message: `You are temporarily banned until ${existingUser.bannedUntil.toISOString()}`,
                    bannedUntil: existingUser.bannedUntil
                });
            }
        } 
         if(existingUser){
            const token=jwt.sign({userId:existingUser._id},process.env.JWT_PASSWORD)
            res.status(200).json({user:existingUser,token})
         }
         else{
            res.status(404).json('user not found')
         }

    }
    catch(err){
        res.status(500).json(err)
    }
    
}

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