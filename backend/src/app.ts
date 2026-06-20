import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRouter } from "./routes/auth-routes.js";
import { githubRouter } from "./routes/github-routes.js";
import { healthRouter } from "./routes/health-routes.js";
import { userRouter } from "./routes/user-routes.js";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
  })
);
app.use(express.json());

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/github", githubRouter);
app.use("/api/user", userRouter);

app.use(errorHandler);
