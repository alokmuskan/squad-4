import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import { submitAssessmentController } from "../controllers/assessment-controller";

const router = Router();

router.post("/submit", authenticateToken, submitAssessmentController);

export default router;
