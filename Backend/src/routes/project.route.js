import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { applyToProject, getMarketplaceProjects, getProjectById, postProject } from "../controllers/project.controller";

const router = Router()


router.route("/post-project").post(verifyJWT, postProject)

router.route("/").get( getMarketplaceProjects)

router.route("/:projectId").get(getProjectById)

router.route("/:projectId/apply").post(verifyJWT, applyToProject)


export {router}