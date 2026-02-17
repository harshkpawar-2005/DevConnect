import {Router} from "express";
import { changePassword, getMyProfile, getPublicProfile, getUserCreatedProjects, getUserParticipatedProjects, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateMyProfile, updateResume } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter= Router()

userRouter.route("/register").post(upload.none(),registerUser)
userRouter.route("/login").post(upload.none(),loginUser)

//protected route
userRouter.route("/logout").post(verifyJWT,logoutUser)

//if aceess token expires, use refresh token to get new access token
userRouter.route("/refresh-token").post(refreshAccessToken)

userRouter.route("/change-password").post(upload.none(), verifyJWT, changePassword)

// profile routes
userRouter.route("/me").get(verifyJWT,getMyProfile)
userRouter.route("/me").patch(upload.none(), verifyJWT, updateMyProfile)
userRouter.route("/:username").get(getPublicProfile)

// file uploads
userRouter.route("/me/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
userRouter.route("/me/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
userRouter.route("/me/resume").patch(verifyJWT, upload.single("resume"), updateResume)

// user's projects
userRouter.route("/:username/projects/created").get(getUserCreatedProjects)
userRouter.route("/:username/projects/participated").get(getUserParticipatedProjects)


export default userRouter