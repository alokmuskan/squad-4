import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import {
	analyzeGithubController,
	syncGithubController,
} from "../controllers/user-controller";

const router = Router();

router.post("/sync", authenticateToken, syncGithubController);
router.post("/analyze", authenticateToken, analyzeGithubController);

export default router;
