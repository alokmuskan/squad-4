import type { Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { AppError } from "@/utils/errors";
import {
	saveResumeSchema,
	syncGithubSchema,
	updateCareerGoalSchema,
	updateLearningPreferencesSchema,
} from "../schemas/user-schema";
import {
	analyzeGithub,
	getDashboard,
	getUserProfile,
	saveResumeData,
	syncGithub,
	updateCareerGoal,
	updateLearningPreferences,
} from "../services/user-service";

function ensureUser(req: AuthRequest): NonNullable<AuthRequest["user"]> {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}
	return req.user;
}

export async function getProfileController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const profile = await getUserProfile(user.id);
	if (!profile) throw new AppError("User not found", 404);
	return res.json(profile);
}

export async function updateCareerGoalController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);
	const parsed = updateCareerGoalSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	const { careerGoal } = parsed.data;
	const result = await updateCareerGoal(user.id, careerGoal);
	return res.json(result);
}

export async function saveResumeController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const parsed = saveResumeSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	const { resumeData, careerGoal } = parsed.data;
	if (!resumeData) {
		throw new AppError("resumeData is required", 400);
	}

	const result = await saveResumeData(user.id, resumeData, careerGoal);
	return res.json(result);
}

export async function getDashboardController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const dashboard = await getDashboard(user.id);
	return res.json(dashboard);
}

export async function syncGithubController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const parsed = syncGithubSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	const { githubUsername } = parsed.data;
	const result = await syncGithub(user.id, githubUsername.trim());
	return res.json(result);
}

export async function analyzeGithubController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const result = await analyzeGithub(user.id);
	return res.json(result);
}

export async function updateLearningPreferencesController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);
	const parsed = updateLearningPreferencesSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError("Invalid preferences", 400);
	}
	const result = await updateLearningPreferences(
		user.id,
		parsed.data as unknown as Record<string, unknown>,
	);
	return res.json(result);
}
