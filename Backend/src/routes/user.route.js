import router from "express";
import { getMyProfile, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { use } from "react";

const userRouter= router.Router()

userRouter.route("/register").post(registerUser)
userRouter.route("/login").post(loginUser)

//protected route
userRouter.route("/logout").post(verifyJWT,logoutUser)

//if aceess token expires, use refresh token to get new access token
userRouter.route("/refresh-token").post(refreshAccessToken)

userRouter.route("/change-password").post(verifyJWT, changePassword)

// profile routes
userRouter.route("/me").get(verifyJWT,getMyProfile)
userRouter.route("/me").patch(verifyJWT,updateMyProfile)
userRouter.route("/:userId").get(getPublicProfile)

export { userRouter }