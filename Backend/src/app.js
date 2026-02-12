import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())



//import routes
import userRouter from "./routes/user.route.js"
import projectRouter from "./routes/project.route.js"
import joinRequestRouter from "./routes/joinRequest.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/requests", joinRequestRouter);



export {app}