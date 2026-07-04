import path from "path";
import cors from "cors";
import express from "express";

// Relative paths for your layout configuration
import { auth } from "./config/auth";
import { assessmentRoutes } from "./features/assessments";
import adminResourceRoutes from "./features/recommendations/routes/admin-resource-routes";
import recommendationRoutes from "./features/recommendations/routes/recommendation-routes";
import { skillGapRoutes } from "./features/skill-gap-analysis";
import { userRoutes } from "./features/users";
import githubRoutes from "./features/users/routes/github-routes";
import resumeRoutes from "./features/users/routes/resume-routes";
import { chatbotRoutes } from "./features/chatbot";
import { roadmapRoutes } from "./features/roadmap-generator";
import { refreshMarketProfilesController } from "./features/recommendations/controllers/admin-market-controller";
import { authenticateToken } from "./middleware/authenticate";
import { requireRole } from "./middleware/rbac";
import { errorHandler } from "./middleware/error-handler";

const app = express();

// Added your actual live Vercel application to allow requests through CORS browser blockers
const allowedOrigins = [
    "https://learnflow-frontend-indol.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    }),
);

app.use(express.json({ limit: "15mb" }));

app.all("/api/auth/*", async (req, res) => {
    const host = req.headers.host || "localhost";
    const url = new URL(req.url || "", `http://${host}`);
    const skipHeaders = new Set([
        "host", "connection", "content-length", "keep-alive",
        "transfer-encoding", "accept-encoding",
    ]);
    const headers = new Headers();
    for (const key of Object.keys(req.headers)) {
        if (skipHeaders.has(key.toLowerCase())) continue;
        const value = req.headers[key];
        if (value) {
            headers.set(key, Array.isArray(value) ? value.join(", ") : value);
        }
    }
    const isGetOrHead = req.method === "GET" || req.method === "HEAD";
    const body =
        !isGetOrHead && req.body && typeof req.body === "object" && Object.keys(req.body).length > 0
            ? JSON.stringify(req.body)
            : undefined;
    const request = new Request(url.toString(), {
        method: req.method,
        headers,
        body,
    });
    try {
        const response = await auth.handler(request);
        res.status(response.status);
        const contentType = response.headers.get("content-type");
        if (contentType) res.setHeader("content-type", contentType);
        const setCookies: string[] = [];
        response.headers.forEach((value, key) => {
            const lower = key.toLowerCase();
            if (lower === "content-type") return;
            if (lower === "set-cookie") {
                setCookies.push(value);
                return;
            }
            res.setHeader(key, value);
        });
        for (const cookie of setCookies) {
            res.append("set-cookie", cookie);
        }
        const text = await response.text();
        if (text) {
            res.send(text);
        } else {
            res.end();
        }
    } catch (err) {
        console.error("Better Auth handler error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.use("/api/user", userRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/skill-gap", skillGapRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/admin/resources", adminResourceRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/roadmap", roadmapRoutes);

// FIXED: Replaced the broken frontend serving logic with an explicit health-check point 
// This handles basic requests cleanly without searching for missing index.html paths
app.get("/", (_req, res) => {
    res.json({ status: "healthy", message: "Learn Flow Backend Engine is fully active." });
});

const adminMarketRouter = express.Router();
adminMarketRouter.use(authenticateToken);
adminMarketRouter.use(requireRole("admin"));
adminMarketRouter.post("/refresh", refreshMarketProfilesController);
app.use("/api/admin/market", adminMarketRouter);

app.use(errorHandler);

export default app;