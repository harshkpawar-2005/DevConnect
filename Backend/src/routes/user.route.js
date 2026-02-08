import router from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const userRouter= router.Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)

//protected route
userRouter.route("/logout").post(verifyJWT,logoutUser)

//if aceess token expires, use refresh token to get new access token
userRouter.route("/refresh-token").post(refreshAccessToken)

export { userRouter }