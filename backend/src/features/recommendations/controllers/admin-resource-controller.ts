import type { NextFunction, Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import {
	createResourceSchema,
	updateResourceSchema,
} from "../schemas/admin-resource-schema";
import {
	createResource,
	deactivateResource,
	listResources,
	updateResource,
} from "../services/admin-resource-service";

export async function createResourceController(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const data = createResourceSchema.parse(req.body);
		const resource = await createResource(data);
		res.status(201).json(resource);
	} catch (err) {
		next(err);
	}
}

export async function updateResourceController(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const { id } = req.params;
		const data = updateResourceSchema.parse(req.body);
		const resource = await updateResource(id, data);
		res.json(resource);
	} catch (err) {
		next(err);
	}
}

export async function deactivateResourceController(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const { id } = req.params;
		await deactivateResource(id);
		res.json({ success: true });
	} catch (err) {
		next(err);
	}
}

export async function listResourcesController(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const { skill, platform, difficulty, type, active, page, limit } =
			req.query as Record<string, string | undefined>;

		const result = await listResources({
			skill,
			platform,
			difficulty: difficulty as
				| "beginner"
				| "intermediate"
				| "advanced"
				| undefined,
			type,
			active: active === "true" ? true : active === "false" ? false : undefined,
			page: page ? parseInt(page) : 1,
			limit: limit ? parseInt(limit) : 20,
		});

		res.json(result);
	} catch (err) {
		next(err);
	}
}
