import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  checkIfSaved
} from "../controllers/watchlist.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.post("/:projectId", addToWatchlist);
router.delete("/:projectId", removeFromWatchlist);
router.get("/", getMyWatchlist);
router.get("/check/:projectId", checkIfSaved);

export default router;
