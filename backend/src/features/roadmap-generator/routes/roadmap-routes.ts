import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import {
	createRoadmapController,
	listRoadmapsController,
	getRoadmapController,
	updatePhaseController,
	deleteRoadmapController,
} from "../controllers/roadmap-controller";

const router = Router();

router.post("/generate", authenticateToken, createRoadmapController);
router.get("/", authenticateToken, listRoadmapsController);
router.get("/:roadmapId", authenticateToken, getRoadmapController);
router.patch("/:roadmapId/phase", authenticateToken, updatePhaseController);
router.delete("/:roadmapId", authenticateToken, deleteRoadmapController);

export default router;
