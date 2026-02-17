import "./config/env.js";
import { connectDB } from "./db/index.js";
import { app } from "./app.js";
import { startProjectExpiryJob } from "./utils/cronJobs.js";


connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Server Error: ",error)
        throw error
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`)
    })
    startProjectExpiryJob();
}) 
.catch((error)=>{
    console.log("MONGO db connection failed !!! ", error);
})