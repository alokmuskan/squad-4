import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type AuthTokenPayload = {
  sub: string;
};

export type AuthenticatedRequest = Request & {
  userId: string;
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: "Missing authorization token.",
    });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    (req as AuthenticatedRequest).userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired authorization token.",
    });
  }
}
