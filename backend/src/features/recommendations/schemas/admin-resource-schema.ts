import { z } from "zod";

export const createResourceSchema = z.object({
	skill: z.string().min(1, "Skill is required"),
	title: z.string().min(1, "Title is required"),
	url: z.string().url("Must be a valid URL"),
	platform: z.string().min(1, "Platform is required"),
	type: z.enum([
		"documentation",
		"tutorial",
		"course",
		"video",
		"book",
		"article",
		"project",
		"guide",
	]),
	difficulty: z.enum(["beginner", "intermediate", "advanced"]),
	duration: z.string().optional(),
	reason: z.string().min(1, "Reason is required"),
	tags: z.array(z.string()).optional(),
});

export const updateResourceSchema = createResourceSchema.partial().extend({
	active: z.boolean().optional(),
});

