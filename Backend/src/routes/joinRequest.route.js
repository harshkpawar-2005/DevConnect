import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { acceptApplication, getMyApplications, getProjectApplications, rejectApplication } from "../controllers/joinRequest.controller.js";


const router = Router()

//get the user applied projects 
router.route("/my-applications").get(verifyJWT, getMyApplications)

// get all applications for a project (only owner can access)
router.route("/project/:projectId").get(verifyJWT, getProjectApplications)

// Only owner can accept/reject applications
router.route("/:requestId/accept").post(verifyJWT, acceptApplication)
router.route("/:requestId/reject").post(verifyJWT, rejectApplication)

export default router