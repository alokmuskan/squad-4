import { z } from "zod";

export const markCompleteSchema = z.object({
	completed: z.boolean(),
});

export const rateResourceSchema = z.object({
	rating: z.number().int().min(1).max(5),
});

export const bookmarkResourceSchema = z.object({
	bookmarked: z.boolean(),
});
