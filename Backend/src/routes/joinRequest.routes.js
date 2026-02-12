import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getMyApplications } from "../controllers/joinRequest.controller";


const router = Router()

router.route("/my-applications").get(verifyJWT, getMyApplications)

router.route("/project/:projectId").get(verifyJWT, getProjectApplications)


export {router}