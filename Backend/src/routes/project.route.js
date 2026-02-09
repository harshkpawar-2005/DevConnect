import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()


router.route("/post-project").post(verifyJWT, postProject)

export {router}