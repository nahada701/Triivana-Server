const jwt=require("jsonwebtoken")

const jwtmiddlewareUser=(req,res,next)=>{
    console.log("inside jwt middleware");

    const token=req.headers["authorization"].split(" ")[1]

    if(token){
        try {
            const jwtresponse=jwt.verify(token,process.env.JWT_PASSWORD)
            console.log(jwtresponse);
            req.userId=jwtresponse.userId
            next()
            
        } catch (err) {
        res.status(401).json("Encryption error")
            
        }
    }else{
        res.status(404).json("Authorization failed")
    }
    
}

module.exports=jwtmiddlewareUser
