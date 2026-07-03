import { Router } from "express";
import { analyzeResumeController } from "@/features/skill-gap-analysis";
import { authenticateToken } from "@/middleware/authenticate";

const router = Router();

router.post("/analyze", authenticateToken, analyzeResumeController);

export default router;
