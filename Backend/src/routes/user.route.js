import router from "express";
import { loginUser, registerUser } from "../controllers/user.controller";

const userRouter= router.Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)


export { userRouter }