import type { Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { prisma } from "@/database";
import { AppError } from "@/utils/errors";
import { retrieveJobPostingsForUser } from "@/services/rag/retrievers";
import {
	analyzeResumeSchema,
	analyzeSkillGapSchema,
	fullAnalyzeSchema,
} from "../schemas/skill-gap-schema";
import {
	analyzeResume,
	analyzeResumeAndSkillGap,
	analyzeSkillGap,
	getLatestSkillGap,
} from "../services/analysis-service";
import { CAREER_GOALS } from "../services/career-goals-service";

function ensureUser(req: AuthRequest): NonNullable<AuthRequest["user"]> {
	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}
	return req.user;
}

export async function analyzeResumeController(req: AuthRequest, res: Response) {
	ensureUser(req);
	const parsed = analyzeResumeSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	const result = await analyzeResume(parsed.data);
	return res.json(result);
}

export async function analyzeSkillGapController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);
	const parsed = analyzeSkillGapSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	const result = await analyzeSkillGap(
		user.id,
		parsed.data.skills,
		parsed.data.careerGoal,
		parsed.data.experience,
		parsed.data.education,
		parsed.data.experienceLevel,
	);

	return res.json(result);
}

export async function fullAnalyzeController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);
	const parsed = fullAnalyzeSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	const result = await analyzeResumeAndSkillGap(user.id, parsed.data);
	return res.json(result);
}

export async function getLatestSkillGapController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);
	const result = await getLatestSkillGap(user.id);

	if (!result.skillGap) {
		return res.json({
			message: "No skill gap analysis found. Please run an analysis first.",
		});
	}

	return res.json(result);
}

export async function getJobMatchesController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);
	const { careerGoal } = req.query;

	if (!careerGoal || typeof careerGoal !== "string") {
		throw new AppError("careerGoal query parameter is required", 400);
	}

	const userRecord = await prisma.user.findUnique({
		where: { id: user.id },
		select: { skills: true },
	});

	const skills = userRecord?.skills || [];
	if (skills.length === 0) {
		return res.json({ message: "No skills found for user. Run a skill gap analysis first.", matches: [] });
	}

	const matches = await retrieveJobPostingsForUser(skills, careerGoal, 20);
	return res.json({ matches });
}

export async function getProgressHistoryController(
	req: AuthRequest,
	res: Response,
) {
	const user = ensureUser(req);

	const [snapshots, latestGap] = await Promise.all([
		prisma.skillGapSnapshot.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			take: 20,
		}),
		prisma.skillGap.findFirst({
			where: { userId: user.id },
			orderBy: { updatedAt: "desc" },
		}),
	]);

	return res.json({
		snapshots: snapshots.map((s) => ({
			id: s.id,
			goal: s.goal,
			matchScore: s.matchScore,
			createdAt: s.createdAt,
		})),
		currentGoal: latestGap?.goal || null,
		currentScore: latestGap?.matchScore || null,
	});
}

export async function getCareerGoalsController(
	_req: AuthRequest,
	res: Response,
) {
	return res.json({ careerGoals: CAREER_GOALS });
}
