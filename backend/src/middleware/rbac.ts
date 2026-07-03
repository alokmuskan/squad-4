import type { NextFunction, Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { AppError } from "@/utils/errors";

export function requireRole(...roles: string[]) {
	return (req: AuthRequest, _res: Response, next: NextFunction) => {
		if (!req.user) {
			throw new AppError("Unauthorized", 401);
		}

		if (!req.user.role || !roles.includes(req.user.role)) {
			throw new AppError("Forbidden: insufficient permissions", 403);
		}

		next();
	};
}
