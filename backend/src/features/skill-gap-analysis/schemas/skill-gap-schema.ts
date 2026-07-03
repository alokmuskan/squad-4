import { z } from "zod";
import { CAREER_GOALS } from "../services/career-goals-service";

const careerGoalEnum = z.enum(CAREER_GOALS as unknown as [string, ...string[]]);

export const analyzeSkillGapSchema = z.object({
	skills: z
		.array(z.string().min(1).max(100))
		.min(1, "At least one skill is required"),
	careerGoal: careerGoalEnum,
	experienceLevel: z.enum(["fresher", "mid", "senior"]).optional(),
	experience: z
		.array(
			z.object({
				role: z.string().min(1),
				company: z.string().min(1),
				duration: z.string().min(1),
			}),
		)
		.optional(),
	education: z
		.array(
			z.object({
				degree: z.string().min(1),
				school: z.string().min(1),
				year: z.string().min(1),
			}),
		)
		.optional(),
});

export const analyzeResumeSchema = z.object({
	file: z.string().min(1, "No file provided").max(50_000_000, "File too large"),
	fileName: z.string().optional(),
	mimeType: z.string().optional(),
	careerGoal: careerGoalEnum.optional(),
});

export const fullAnalyzeSchema = z.object({
	file: z.string().min(1, "No file provided").max(50_000_000, "File too large"),
	fileName: z.string().optional(),
	mimeType: z.string().optional(),
	careerGoal: careerGoalEnum,
	experienceLevel: z.enum(["fresher", "mid", "senior"]).optional(),
});


