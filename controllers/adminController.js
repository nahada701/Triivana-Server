const admins=require("../models/adminModel")
const jwt=require('jsonwebtoken')

exports.adminRegisterController=async(req,res)=>{
    console.log("inside admin register controller");

    const{firstname,lastname,email,password}=req.body
    
    try{
        const existingAdmin=await admins.findOne({email})
        if(existingAdmin){
            res.status(406).json("account already exists try login")
        }else{
            const newAdmin=new admins({firstname,lastname,email,password})
            await newAdmin.save()
            res.status(200).json(newAdmin)
        }
    }catch(err){
        res.status(500).json(err)
    }
    
}

exports.adminLoginController=async(req,res)=>{
    console.log("inside admin login cotroller");
    const{email,password}=req.body

    try {
        const existingAdmin=await admins.findOne({email,password})
        if(existingAdmin){
            const token=jwt.sign({adminId:existingAdmin._id},process.env.JWT_PASSWORD)
            res.status(200).json({admin:existingAdmin,token})

        }else{
            res.status(404).json("Invalid email or password")
        }
    } catch (err) {
        res.status(500).json(err)
    }
    
}
exports.adminChangePasswordcontroller=async(req,res)=>{
    console.log("Inside admin chanage password ");

     const { email, oldPassword, newPassword } = req.body;
     const adminId=req.adminId
    console.log(email, oldPassword, newPassword);
    
      try {
      
        const existingAdmin = await admins.findOne({ _id:adminId,email });
    console.log(existingAdmin);
    
        if (!existingAdmin) {
          return res.status(404).json({ message: " Admin not found" });
        }
    
        const isMatch =  oldPassword==existingAdmin.password    
        if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect" });
        }
    
    
        existingAdmin.password = newPassword;
        await existingAdmin.save();
    
        res.status(200).json({ message: "Password changed successfully" });
      } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
      }
    
}