import router from "express";
import { getMyProfile, loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";

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

// file uploads
userRouter.route("/me/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
userRouter.route("/me/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
userRouter.route("/me/resume").patch(verifyJWT, upload.single("resume"), updateResume)


export { userRouter }
