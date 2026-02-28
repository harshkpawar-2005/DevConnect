import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { applyToProject, getMarketplaceProjects, getMyProjects, getProjectById, markProjectCompleted, pauseRecruiting, postProject, resumeRecruiting, stopRecruiting } from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()


router.route("/post-project").post(upload.none(), verifyJWT, postProject)

router.route("/").get(getMarketplaceProjects)
router.route("/my-projects").get(verifyJWT, getMyProjects)
router.route("/:projectId").get(getProjectById)

router.route("/:projectId/apply").post(upload.none(), verifyJWT, applyToProject)
router.route("/:projectId/stop-recruiting").post(upload.none(), verifyJWT, stopRecruiting)
router.route("/:projectId/pause-recruiting").post(upload.none(), verifyJWT, pauseRecruiting)
router.route("/:projectId/resume-recruiting").post(upload.none(), verifyJWT, resumeRecruiting)
router.route("/:projectId/mark-completed").post(upload.none(), verifyJWT, markProjectCompleted)


export default router