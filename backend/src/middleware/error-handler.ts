import type { NextFunction, Request, Response } from "express";
import { AppError } from "@/utils/errors";

export function errorHandler(
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) {
	if (err instanceof AppError) {
		return res.status(err.statusCode).json({
			error: err.message,
			...(err.details ? { details: err.details } : {}),
		});
	}

	console.error("Unhandled error:", err);
	return res.status(500).json({
		error: "Internal server error",
	});
}
