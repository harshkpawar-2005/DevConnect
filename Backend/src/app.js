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
import joinRequestRouter from "./routes/joinRequest.route.js"
import workspaceRouter from "./routes/workspace.route.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/requests", joinRequestRouter)
app.use("/api/v1/workspaces", workspaceRouter)



export {app}