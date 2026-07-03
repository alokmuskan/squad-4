import { z } from "zod";

export const generateRoadmapSchema = z.object({
	goal: z.string().min(1).max(200),
	source: z.enum(["ai", "structured"]).optional().default("ai"),
});

export const updatePhaseSchema = z.object({
	phaseId: z.string().min(1),
	status: z.enum(["locked", "available", "in_progress", "completed"]),
});
