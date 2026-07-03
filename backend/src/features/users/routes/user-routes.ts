import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import {
	analyzeGithubController,
	getDashboardController,
	getProfileController,
	saveResumeController,
	syncGithubController,
	updateCareerGoalController,
	updateLearningPreferencesController,
} from "../controllers/user-controller";

const router = Router();

router.get("/profile", authenticateToken, getProfileController);
router.patch("/career-goal", authenticateToken, updateCareerGoalController);
router.patch(
	"/learning-preferences",
	authenticateToken,
	updateLearningPreferencesController,
);
router.post("/resume", authenticateToken, saveResumeController);
router.get("/dashboard", authenticateToken, getDashboardController);
router.post("/github/sync", authenticateToken, syncGithubController);
router.post("/github/analyze", authenticateToken, analyzeGithubController);

export default router;
