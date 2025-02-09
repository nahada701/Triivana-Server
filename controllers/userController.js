//controller require models ie.database 

const users=require('../models/userModel')
const jwt=require('jsonwebtoken')


exports.userRegisterController=async(req,res)=>{
console.log('inside user registration controller');
 
const{email,password}=req.body
try{
    const existingUser=await users.findOne({email})
    if(existingUser){
        res.status(406).json("user already exists")

    }
    else{
        const newUser=new users({email,password})
        await newUser.save()
        res.status(200).json(newUser)
    }

}catch(err){
    res.status(401).json(err)
}


}

exports.userLoginController=async(req,res)=>{
    console.log("inside user login controller");
    try{
       
         const {email,password}=req.body
         const existingUser=await users.findOne({email,password})
         if(existingUser){
            const token=jwt.sign({userId:existingUser._id},process.env.JWT_PASSWORD)
            res.status(200).json({user:existingUser,token})
         }
         else{
            res.status(404).json('user not found')
         }

    }
    catch(err){
        res.status(401).json(err)
    }
    
}