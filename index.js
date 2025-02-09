require ("dotenv").config()
const cors=require("cors")
const express=require("express")
const routes=require('./Router/router')
require('./db/dbconnection')
const trivanaServer=express()
trivanaServer.use(cors())
trivanaServer.use(express.json())
trivanaServer.use(express.urlencoded({ extended: true }));
trivanaServer.use(routes)
trivanaServer.use('/uploads',express.static('./uploads'))

const PORT=3000||process.env.PORT 



trivanaServer.listen(PORT,()=>{
    console.log(`server ${PORT} running successfully and waiting for client request`);
    
})
