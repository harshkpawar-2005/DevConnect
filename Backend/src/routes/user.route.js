import router from "express";
import { registerUser } from "../controllers/user.controller";

const userRouter= router.Router()

userRouter.route("/register").post(registerUser)


export { userRouter }