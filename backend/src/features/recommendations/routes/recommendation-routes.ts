import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import {
	bookmarkRecommendation,
	getFeedbackHistory,
	getLatestSnapshotController,
	getRecommendations,
	getResourceAnalyticsController,
	markComplete,
	rateRecommendation,
	triggerFullAnalysis,
} from "../controllers/recommendation-controller";

const router = Router();

router.use(authenticateToken);

router.get("/", getRecommendations);
router.get("/snapshot", getLatestSnapshotController);
router.get("/history", getFeedbackHistory);
router.get("/analytics", getResourceAnalyticsController);
router.post("/analyze", triggerFullAnalysis);
router.patch("/:id/complete", markComplete);
router.post("/:id/rate", rateRecommendation);
router.post("/:id/bookmark", bookmarkRecommendation);

export default router;
