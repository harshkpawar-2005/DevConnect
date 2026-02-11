import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getMarketplaceProjects } from "../controllers/project.controller";

const router = Router()


router.route("/post-project").post(verifyJWT, postProject)

router.route("/").get( getMarketplaceProjects)

export {router}