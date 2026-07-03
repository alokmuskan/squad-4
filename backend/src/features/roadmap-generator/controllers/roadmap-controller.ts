import type { Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { AppError } from "@/utils/errors";
import { generateRoadmapSchema, updatePhaseSchema } from "../schemas/roadmap-schema";
import { generateRoadmap, getUserRoadmaps, getRoadmapById, updatePhaseStatus, deleteRoadmap } from "../services/roadmap-service";

function ensureUser(req: AuthRequest): NonNullable<AuthRequest["user"]> {
	if (!req.user) throw new AppError("Unauthorized", 401);
	return req.user;
}

export async function createRoadmapController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const parsed = generateRoadmapSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError("Invalid request", 400, parsed.error.flatten().fieldErrors);
	}
	const { goal, source } = parsed.data;
	const roadmap = await generateRoadmap(user.id, goal, source);
	return res.status(201).json(roadmap);
}

export async function listRoadmapsController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const roadmaps = await getUserRoadmaps(user.id);
	return res.json({ roadmaps });
}

export async function getRoadmapController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const { roadmapId } = req.params;
	if (!roadmapId) throw new AppError("roadmapId parameter is required", 400);
	const roadmap = await getRoadmapById(user.id, roadmapId);
	return res.json(roadmap);
}

export async function updatePhaseController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const { roadmapId } = req.params;
	if (!roadmapId) throw new AppError("roadmapId parameter is required", 400);
	const parsed = updatePhaseSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError("Invalid request", 400, parsed.error.flatten().fieldErrors);
	}
	const { phaseId, status } = parsed.data;
	const roadmap = await updatePhaseStatus(user.id, roadmapId, phaseId, status);
	return res.json(roadmap);
}

export async function deleteRoadmapController(req: AuthRequest, res: Response) {
	const user = ensureUser(req);
	const { roadmapId } = req.params;
	if (!roadmapId) throw new AppError("roadmapId parameter is required", 400);
	await deleteRoadmap(user.id, roadmapId);
	return res.status(204).send();
}
