import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

type AuthTokenPayload = {
  sub: string;
};

export function createAuthToken(userId: string) {
  const payload: AuthTokenPayload = { sub: userId };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}
