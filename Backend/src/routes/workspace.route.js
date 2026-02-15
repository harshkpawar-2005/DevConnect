import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMyWorkspaces, getWorkspace } from "../controllers/workspace.controller.js";

const router = Router();

router.route("/my").get(verifyJWT, getMyWorkspaces);
router.route("/:projectId").get(verifyJWT, getWorkspace);



export default router;