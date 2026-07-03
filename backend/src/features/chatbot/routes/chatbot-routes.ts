import { Router } from "express";
import { authenticateToken } from "@/middleware/authenticate";
import {
	createSessionController,
	listSessionsController,
	getSessionMessagesController,
	sendMessageController,
	deleteSessionController,
} from "../controllers/chatbot-controller";

const router = Router();

router.post("/sessions", authenticateToken, createSessionController);
router.get("/sessions", authenticateToken, listSessionsController);
router.get("/sessions/:sessionId/messages", authenticateToken, getSessionMessagesController);
router.post("/messages", authenticateToken, sendMessageController);
router.delete("/sessions/:sessionId", authenticateToken, deleteSessionController);

export default router;

