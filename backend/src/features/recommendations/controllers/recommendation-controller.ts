import type { NextFunction, Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { aggregateProfileNode } from "@/features/ai-agents/services/aggregate-service";
import { githubAnalysisNode } from "@/features/ai-agents/services/github-service";
import { persistResultsNode } from "@/features/ai-agents/services/persist-service";
import { resourceRecommendationNode } from "@/features/ai-agents/services/resource-service";
import { resumeAnalysisNode } from "@/features/ai-agents/services/resume-service";
import { skillGapAnalysisNode } from "@/features/ai-agents/services/skill-gap-service";
import type { AgentState } from "@/features/ai-agents/types/agent.types";
import { AppError } from "@/utils/errors";
import {
	bookmarkResourceSchema,
	markCompleteSchema,
	rateResourceSchema,
} from "../schemas/recommendation-schema";
import {
	getLatestSnapshot,
	getResourceAnalytics,
	getResourceRecommendations,
	getUserFeedbackHistory,
	markResourceComplete,
	rateResource,
	toggleBookmark,
} from "../services/recommendation-service";

export async function getRecommendations(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		const goal = req.query.goal as string | undefined;
		const result = await getResourceRecommendations(userId, goal);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function markComplete(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		const { id } = req.params;
		const { completed } = markCompleteSchema.parse(req.body);

		const result = await markResourceComplete(id, userId, completed);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getLatestSnapshotController(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		const result = await getLatestSnapshot(userId);
		if (!result) {
			res.json({ snapshotId: null, matchScore: 0, goal: "", createdAt: "" });
			return;
		}
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function triggerFullAnalysis(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		let state: AgentState = {
			userId,
			careerGoal: req.body.careerGoal || "",
			status: "running",
			resumeResult: req.body.resumeData ?? null,
			githubResult: req.body.githubData ?? null,
			aggregatedSkills: [],
			aggregatedExperience: [],
			aggregatedEducation: [],
			resourceRecommendations: [],
		};

		const [resumeUpdate, githubUpdate] = await Promise.all([
			resumeAnalysisNode(state),
			githubAnalysisNode(state),
		]);
		state = { ...state, ...resumeUpdate, ...githubUpdate };

		const aggregateUpdate = await aggregateProfileNode(state);
		state = { ...state, ...aggregateUpdate };

		const skillGapUpdate = await skillGapAnalysisNode(state);
		state = { ...state, ...skillGapUpdate };

		const resourceUpdate = await resourceRecommendationNode(state);
		state = { ...state, ...resourceUpdate };

		const persistUpdate = await persistResultsNode(state);
		state = { ...state, ...persistUpdate };

		res.json(state);
	} catch (err) {
		next(err);
	}
}

export async function rateRecommendation(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		const { id } = req.params;
		const { rating } = rateResourceSchema.parse(req.body);

		await rateResource(id, userId, rating);
		res.json({ success: true });
	} catch (err) {
		next(err);
	}
}

export async function bookmarkRecommendation(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		const { id } = req.params;
		const { bookmarked } = bookmarkResourceSchema.parse(req.body);

		await toggleBookmark(id, userId, bookmarked);
		res.json({ success: true });
	} catch (err) {
		next(err);
	}
}

export async function getFeedbackHistory(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const userId = req.user?.id;
		if (!userId) throw new AppError("Unauthorized", 401);

		const result = await getUserFeedbackHistory(userId);
		res.json(result);
	} catch (err) {
		next(err);
	}
}

export async function getResourceAnalyticsController(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const skill = req.query.skill as string | undefined;
		const result = await getResourceAnalytics(skill);
		res.json(result);
	} catch (err) {
		next(err);
	}
}
