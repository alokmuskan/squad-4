import { z } from "zod";

export const updateCareerGoalSchema = z.object({
	careerGoal: z.string().min(1, "careerGoal is required"),
});

export const saveResumeSchema = z.object({
	resumeData: z.record(z.string(), z.unknown()).optional(),
	careerGoal: z.string().optional(),
});

export const syncGithubSchema = z.object({
	githubUsername: z.string().min(1, "GitHub username is required"),
});

export const updateLearningPreferencesSchema = z.record(z.string(), z.unknown());


