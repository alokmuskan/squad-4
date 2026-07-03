import type { Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { AppError } from "@/utils/errors";
import { createSessionSchema, sendMessageSchema } from "../schemas/chatbot-schema";
import {
	getOrCreateSession,
	getUserSessions,
	getSessionMessages,
	sendMessage,
	deleteSession,
} from "../services/chatbot-service";

function ensureUser(req: AuthRequest): NonNullable<AuthRequest["user"]> {
	if (!req.user) throw new AppError("Unauthorized", 401);
	return req.user;
}

export async function createSessionController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const parsed = createSessionSchema.safeParse(req.body);
	const title = parsed.success ? parsed.data.title : undefined;
	const session = await getOrCreateSession(user.id, title);
	return res.status(201).json(session);
}

export async function listSessionsController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const sessions = await getUserSessions(user.id);
	return res.json({ sessions });
}

export async function getSessionMessagesController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const { sessionId } = req.params;
	if (!sessionId) throw new AppError("sessionId parameter is required", 400);
	const messages = await getSessionMessages(user.id, sessionId);
	return res.json({ messages });
}

export async function sendMessageController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const parsed = sendMessageSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError("Invalid request body", 400, parsed.error.flatten().fieldErrors);
	}

	const { sessionId, content, fileData } = parsed.data;
	const result = await sendMessage(user.id, sessionId, content, fileData);
	return res.json(result);
}

export async function deleteSessionController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const { sessionId } = req.params;
	if (!sessionId) throw new AppError("sessionId parameter is required", 400);
	await deleteSession(user.id, sessionId);
	return res.status(204).send();
}
