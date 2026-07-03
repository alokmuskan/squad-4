import axios from "axios";
import { prisma } from "@/database";
import { AppError } from "@/utils/errors";
import type { RoadmapPhase, RoadmapResponse } from "../types/roadmap.types";
import type { Prisma } from "@prisma/client";

function asJson<T>(v: T): Prisma.InputJsonValue {
	return JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
}

const AI_TIMEOUT_MS = 60_000;

const STRUCTURED_ROADMAPS: Record<string, Omit<RoadmapPhase, "status" | "order">[]> = {
	"AI / Machine Learning Engineer": [
		{ id: "phase-1", label: "Math & Python Foundations", duration: "3 weeks", description: "Build the mathematical and programming foundation required for all ML work.", skills: ["Linear Algebra", "Statistics", "NumPy", "Pandas", "Python OOP"], milestones: ["Implement matrix operations from scratch", "Complete a statistics project with NumPy/Pandas"], resources: [{ label: "3Blue1Brown – Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab" }, { label: "Kaggle Learn – Python", url: "https://www.kaggle.com/learn/python" }] },
		{ id: "phase-2", label: "Classic Machine Learning", duration: "4 weeks", description: "Master supervised and unsupervised learning algorithms with scikit-learn.", skills: ["Regression", "Classification", "Clustering", "Scikit-learn", "Model Evaluation"], milestones: ["Train and evaluate 3 models on a real dataset", "Achieve 80%+ accuracy on a Kaggle beginner competition"], resources: [{ label: "Hands-On ML with Scikit-Learn", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/" }, { label: "StatQuest – ML Fundamentals", url: "https://www.youtube.com/@statquest" }] },
		{ id: "phase-3", label: "Deep Learning", duration: "5 weeks", description: "Understand neural networks and build deep learning models with PyTorch.", skills: ["PyTorch", "CNNs", "RNNs", "Backpropagation", "Transfer Learning"], milestones: ["Train a CNN on CIFAR-10 with >85% accuracy", "Build an RNN for text generation"], resources: [{ label: "PyTorch Official Tutorials", url: "https://pytorch.org/tutorials/" }, { label: "fast.ai – Practical Deep Learning", url: "https://course.fast.ai" }] },
		{ id: "phase-4", label: "NLP & Transformers", duration: "4 weeks", description: "Master transformer architecture and large language models.", skills: ["Tokenization", "Attention Mechanism", "HuggingFace", "Fine-tuning", "RAG"], milestones: ["Fine-tune a language model on custom data", "Build a RAG pipeline with vector search"], resources: [{ label: "HuggingFace NLP Course", url: "https://huggingface.co/learn/nlp-course" }, { label: "Attention Is All You Need (Paper)", url: "https://arxiv.org/abs/1706.03762" }] },
		{ id: "phase-5", label: "MLOps & Deployment", duration: "3 weeks", description: "Ship models to production with monitoring and CI/CD.", skills: ["FastAPI", "Docker", "MLflow", "Model Serving", "CI/CD"], milestones: ["Deploy a model as a REST API", "Set up experiment tracking with MLflow"], resources: [{ label: "Full Stack Deep Learning", url: "https://fullstackdeeplearning.com" }, { label: "MLflow Docs", url: "https://mlflow.org/docs/latest/index.html" }] },
		{ id: "phase-6", label: "Capstone Project", duration: "4 weeks", description: "Build an end-to-end ML project demonstrating all acquired skills.", skills: ["Problem Scoping", "Data Collection", "Model Training", "Deployment", "Documentation"], milestones: ["Ship a complete ML project on GitHub", "Write a detailed README with results and architecture"], resources: [{ label: "Kaggle Competitions", url: "https://www.kaggle.com/competitions" }, { label: "Papers With Code", url: "https://paperswithcode.com" }] },
	],
	"Frontend Engineer": [
		{ id: "phase-1", label: "HTML & CSS Mastery", duration: "2 weeks", description: "Build pixel-perfect, responsive layouts with modern CSS.", skills: ["Semantic HTML5", "CSS Grid", "Flexbox", "Responsive Design", "CSS Animations"], milestones: ["Clone 3 real website layouts from scratch", "Build a fully responsive portfolio page"], resources: [{ label: "CSS Tricks – Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/" }, { label: "Kevin Powell – CSS YouTube", url: "https://www.youtube.com/@KevinPowell" }] },
		{ id: "phase-2", label: "JavaScript Deep Dive", duration: "3 weeks", description: "Master JavaScript fundamentals, async patterns, and modern ES6+ features.", skills: ["Closures & Scope", "Async/Await", "Promises", "Array Methods", "Modules"], milestones: ["Build a weather app with fetch API", "Implement a promise-based task queue"], resources: [{ label: "javascript.info", url: "https://javascript.info" }, { label: "You Don't Know JS (Free Book)", url: "https://github.com/getify/You-Dont-Know-JS" }] },
		{ id: "phase-3", label: "React & TypeScript", duration: "4 weeks", description: "Build component-driven UIs with type safety and modern React patterns.", skills: ["JSX", "Hooks", "React Router", "TypeScript", "State Management"], milestones: ["Build a typed e-commerce product page", "Implement a custom hook library"], resources: [{ label: "React Official Docs", url: "https://react.dev" }, { label: "Total TypeScript – Free Tutorials", url: "https://www.totaltypescript.com" }] },
		{ id: "phase-4", label: "Modern Tooling & Testing", duration: "3 weeks", description: "Learn build tools, testing frameworks, and developer workflows.", skills: ["Vite", "Vitest", "React Testing Library", "Git Workflows", "CI/CD"], milestones: ["Set up a full CI pipeline with tests", "Achieve 80%+ test coverage on a project"], resources: [{ label: "Vite Official Docs", url: "https://vitejs.dev/guide/" }, { label: "Testing Library Docs", url: "https://testing-library.com/docs/react-testing-library/intro/" }] },
		{ id: "phase-5", label: "Performance & Accessibility", duration: "2 weeks", description: "Make apps fast, accessible, and production-ready.", skills: ["Core Web Vitals", "WCAG 2.1", "Lighthouse", "Code Splitting", "SEO"], milestones: ["Achieve 90+ Lighthouse score", "Implement full keyboard navigation"], resources: [{ label: "web.dev – Performance", url: "https://web.dev/learn/performance/" }, { label: "A11y Project Checklist", url: "https://www.a11yproject.com/checklist/" }] },
		{ id: "phase-6", label: "Portfolio & Deployment", duration: "2 weeks", description: "Ship real projects and build a compelling portfolio.", skills: ["Project Planning", "Vercel/Netlify", "README Writing", "GitHub Profile"], milestones: ["Deploy 2 full-stack projects", "Write detailed case studies for each"], resources: [{ label: "Vercel Deployment Docs", url: "https://vercel.com/docs" }, { label: "Frontend Mentor", url: "https://www.frontendmentor.io" }] },
	],
};

function generateId(): string {
	return `phase-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildStructuredPhases(goal: string): RoadmapPhase[] {
	const template = STRUCTURED_ROADMAPS[goal] || STRUCTURED_ROADMAPS["Frontend Engineer"];
	return template.map((p, i) => ({
		...p,
		id: generateId(),
		status: i === 0 ? "available" : "locked",
		order: i + 1,
	})) as RoadmapPhase[];
}

async function callGemini(prompt: string): Promise<string | null> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey || apiKey === "your_gemini_api_key") return null;
	try {
		const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
		const response = await axios.post(
			`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
			{ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 4096 } },
			{ headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, timeout: AI_TIMEOUT_MS },
		);
		return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
	} catch {
		return null;
	}
}

async function callGroq(prompt: string): Promise<string | null> {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey || apiKey === "your_groq_api_key") return null;
	try {
		const response = await axios.post(
			"https://api.groq.com/openai/v1/chat/completions",
			{ model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 4096 },
			{ headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, timeout: AI_TIMEOUT_MS },
		);
		return response.data?.choices?.[0]?.message?.content || null;
	} catch {
		return null;
	}
}

async function callGithub(prompt: string): Promise<string | null> {
	const apiKey = process.env.GITHUB_TOKEN;
	if (!apiKey || apiKey === "your_github_token") return null;
	try {
		const response = await axios.post(
			"https://models.inference.ai.azure.com/chat/completions",
			{ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 4096 },
			{ headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, timeout: AI_TIMEOUT_MS },
		);
		return response.data?.choices?.[0]?.message?.content || null;
	} catch {
		return null;
	}
}

async function generateAIReply(prompt: string): Promise<string> {
	const gemini = await callGemini(prompt);
	if (gemini) return gemini;
	const groq = await callGroq(prompt);
	if (groq) return groq;
	const github = await callGithub(prompt);
	if (github) return github;
	throw new AppError("All AI providers are currently unavailable.", 503);
}

function buildAIPrompt(goal: string, skills: string[], weak: string[]): string {
	return `You are a senior career roadmap architect. Create a personalized 6-phase learning roadmap for someone pursuing "${goal}".

Their current skills: ${skills.join(", ") || "not specified"}.
Their skill gaps to fill: ${weak.join(", ") || "not specified"}.

Return a JSON array of 6 phases, each with:
- "label": short phase name
- "duration": estimated time (e.g. "3 weeks")
- "description": 1-2 sentence description
- "skills": array of 4-6 specific skills to learn
- "milestones": array of 2 measurable milestones
- "resources": array of 2 objects with "label" and "url" (use real, well-known resources)

Order them from foundational to advanced. Make the roadmap specific to ${goal} and tailored to the user's skill gaps.

Respond with ONLY the JSON array, no other text.`;

}

function parseAIPhases(text: string): RoadmapPhase[] {
	try {
		const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
		const data = JSON.parse(cleaned);
		if (!Array.isArray(data)) throw new Error("Not an array");
		return data.map((p: Record<string, unknown>, i: number) => ({
			id: generateId(),
			label: String(p.label || `Phase ${i + 1}`),
			duration: String(p.duration || "2 weeks"),
			description: String(p.description || ""),
			skills: Array.isArray(p.skills) ? p.skills.map(String) : [],
			milestones: Array.isArray(p.milestones) ? p.milestones.map(String) : [],
			resources: Array.isArray(p.resources) ? p.resources.map((r: Record<string, string>) => ({ label: String(r.label || ""), url: String(r.url || "") })) : [],
			status: i === 0 ? "available" : "locked",
			order: i + 1,
		}));
	} catch {
		throw new AppError("AI returned an invalid roadmap format. Please try again.", 500);
	}
}

export async function generateRoadmap(
	userId: string,
	goal: string,
	source: "ai" | "structured" = "ai",
): Promise<RoadmapResponse> {
	const userRecord = await prisma.user.findUnique({
		where: { id: userId },
		select: { skills: true, careerGoal: true },
	});

	const latestSkillGap = await prisma.skillGap.findFirst({
		where: { userId },
		orderBy: { updatedAt: "desc" },
		select: { weak: true },
	});

	const skills = userRecord?.skills || [];
	const weak = latestSkillGap?.weak || [];

	let phases: RoadmapPhase[];

	if (source === "structured") {
		phases = buildStructuredPhases(goal);
	} else {
		const prompt = buildAIPrompt(goal, skills, weak);
		const aiText = await generateAIReply(prompt);
		phases = parseAIPhases(aiText);
	}

	const totalWeeks = phases.reduce((sum, p) => {
		const match = p.duration.match(/(\d+)/);
		return sum + (match ? Number.parseInt(match[1]) : 2);
	}, 0);

	const roadmap = await prisma.roadmap.create({
		data: {
			userId,
			title: `${goal} Learning Roadmap`,
			goal,
			duration: `${totalWeeks} weeks`,
			phases: asJson(phases),
		},
	});

	return formatRoadmap(roadmap);
}

export async function getUserRoadmaps(userId: string): Promise<RoadmapResponse[]> {
	const roadmaps = await prisma.roadmap.findMany({
		where: { userId },
		orderBy: { updatedAt: "desc" },
	});
	return roadmaps.map(formatRoadmap);
}

export async function getRoadmapById(userId: string, roadmapId: string): Promise<RoadmapResponse> {
	const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
	if (!roadmap || roadmap.userId !== userId) {
		throw new AppError("Roadmap not found", 404);
	}
	return formatRoadmap(roadmap);
}

export async function updatePhaseStatus(
	userId: string,
	roadmapId: string,
	phaseId: string,
	status: RoadmapPhase["status"],
): Promise<RoadmapResponse> {
	const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
	if (!roadmap || roadmap.userId !== userId) {
		throw new AppError("Roadmap not found", 404);
	}

	const phases = (roadmap.phases as unknown as RoadmapPhase[]).map((p) => {
		if (p.id !== phaseId) return p;
		return { ...p, status };
	});

	if (status === "completed") {
		const currentIndex = phases.findIndex((p) => p.id === phaseId);
		if (currentIndex >= 0 && currentIndex < phases.length - 1) {
			phases[currentIndex + 1] = { ...phases[currentIndex + 1], status: "available" };
		}
	}

	const updated = await prisma.roadmap.update({
		where: { id: roadmapId },
		data: { phases: asJson(phases) },
	});

	return formatRoadmap(updated);
}

export async function deleteRoadmap(userId: string, roadmapId: string): Promise<void> {
	const roadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
	if (!roadmap || roadmap.userId !== userId) {
		throw new AppError("Roadmap not found", 404);
	}
	await prisma.roadmap.delete({ where: { id: roadmapId } });
}

function formatRoadmap(roadmap: { id: string; title: string; goal: string; duration: string; phases: unknown; createdAt: Date; updatedAt: Date }): RoadmapResponse {
	const phases = roadmap.phases as unknown as RoadmapPhase[];
	const completed = phases.filter((p) => p.status === "completed").length;
	const progress = phases.length > 0 ? Math.round((completed / phases.length) * 100) : 0;

	return {
		id: roadmap.id,
		title: roadmap.title,
		goal: roadmap.goal,
		duration: roadmap.duration,
		phases,
		progress,
		createdAt: roadmap.createdAt.toISOString(),
		updatedAt: roadmap.updatedAt.toISOString(),
	};
}
