import type { Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { AppError } from "@/utils/errors";
import { submitAssessmentSchema } from "../schemas/assessment-schema";
import { submitAssessment } from "../services/assessment-service";

export async function submitAssessmentController(
	req: AuthRequest,
	res: Response,
) {
	const parsed = submitAssessmentSchema.safeParse(req.body);
	if (!parsed.success) {
		throw new AppError(
			"Invalid request body",
			400,
			parsed.error.flatten().fieldErrors,
		);
	}

	if (!req.user) {
		throw new AppError("Unauthorized", 401);
	}

	const { assessmentId, answers } = parsed.data;
	const result = await submitAssessment(req.user.id, assessmentId, answers);
	return res.json(result);
}
