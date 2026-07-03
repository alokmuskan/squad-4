import { z } from "zod";

export const createSessionSchema = z.object({
	title: z.string().max(200).optional(),
});

export const sendMessageSchema = z.object({
	sessionId: z.string().uuid(),
	content: z.string().min(1).max(10000),
	fileData: z
		.object({
			base64: z.string().min(1),
			mimeType: z.string().min(1),
			fileName: z.string().min(1),
		})
		.optional()
		.nullable(),
});

export const getSessionMessagesSchema = z.object({
	sessionId: z.string().uuid(),
});

