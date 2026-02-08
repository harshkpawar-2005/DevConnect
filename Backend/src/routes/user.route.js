import router from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const userRouter= router.Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)

//protected route
userRouter.route("/logout").post(verifyJWT,logoutUser)


export { userRouter }