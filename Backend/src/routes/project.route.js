import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { applyToProject, getMarketplaceProjects, getProjectById, markProjectCompleted, pauseRecruiting, postProject, resumeRecruiting, stopRecruiting } from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.route("/post-project").post(verifyJWT, postProject)

router.route("/").get( getMarketplaceProjects)

router.route("/:projectId").get(getProjectById)

router.route("/:projectId/apply").post(upload.none(), verifyJWT, applyToProject)
router.route("/:projectId/stop-recruiting").post(verifyJWT, stopRecruiting)
router.route("/:projectId/pause-recruiting").post(verifyJWT, pauseRecruiting)
router.route("/:projectId/resume-recruiting").post(verifyJWT, resumeRecruiting)
router.route("/:projectId/mark-completed").post(verifyJWT, markProjectCompleted)


export default router