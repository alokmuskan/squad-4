import axios from "axios";
import { prisma } from "@/database";
import { AppError } from "@/utils/errors";
const { PDFParse, VerbosityLevel } = require("pdf-parse");

const AI_TIMEOUT_MS = 60_000;

interface UserContext {
	fullName?: string | null;
	careerGoal?: string | null;
	skills?: string[];
	resumeData?: {
		skills?: string[];
		softSkills?: string[];
		experience?: { role: string; company: string; duration: string }[];
		education?: { degree: string; school: string; year: string }[];
		summary?: string;
		resumeScore?: number;
		strengths?: string[];
		improvements?: string[];
		atsTips?: string[];
		careerFit?: { score: number; summary: string };
	} | null;
	github?: {
		username?: string | null;
		bio?: string | null;
		location?: string | null;
		followers?: number;
		following?: number;
		publicRepos?: number;
		totalStars?: number;
		topLanguages?: string;
		repoCount?: number;
	} | null;
	skillGap?: {
		goal?: string;
		matchScore?: number;
		strong?: string[];
		weak?: string[];
		improving?: string[];
		coach?: string;
		roadmap?: { step: string; details: string; duration: string }[];
	} | null;
	assessment?: {
		latestScore?: number | null;
	} | null;
}

async function buildRichSystemPrompt(userId: string): Promise<string> {
	const [userRecord, repositories, latestSkillGap, latestAssessment] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			select: {
				fullName: true,
				careerGoal: true,
				skills: true,
				resumeData: true,
				githubUsername: true,
				githubBio: true,
				githubLocation: true,
				githubFollowers: true,
				githubFollowing: true,
				githubPublicRepos: true,
			},
		}),
		prisma.repository.findMany({
			where: { userId },
			select: { name: true, description: true, language: true, starsCount: true },
			orderBy: { starsCount: "desc" },
			take: 20,
		}),
		prisma.skillGap.findFirst({
			where: { userId },
			orderBy: { updatedAt: "desc" },
		}),
		prisma.assessment.findFirst({
			where: { userId },
			orderBy: { createdAt: "desc" },
		}),
	]);

	const ctx: UserContext = {};

	if (userRecord) {
		ctx.fullName = userRecord.fullName;
		ctx.careerGoal = userRecord.careerGoal;
		ctx.skills = userRecord.skills || [];

		const rd = userRecord.resumeData as Record<string, unknown> | null;
		if (rd && typeof rd === "object") {
			ctx.resumeData = {
				skills: (rd.skills as string[]) || [],
				softSkills: (rd.softSkills as string[]) || [],
				experience: (rd.experience as { role: string; company: string; duration: string }[]) || [],
				education: (rd.education as { degree: string; school: string; year: string }[]) || [],
				summary: rd.summary as string,
				resumeScore: rd.resumeScore as number,
				strengths: (rd.strengths as string[]) || [],
				improvements: (rd.improvements as string[]) || [],
				atsTips: (rd.atsTips as string[]) || [],
				careerFit: rd.careerFit as { score: number; summary: string },
			};
		}

		const totalStars = repositories.reduce((sum, r) => sum + r.starsCount, 0);
		const langCounts = new Map<string, number>();
		for (const r of repositories) {
			if (r.language) {
				langCounts.set(r.language, (langCounts.get(r.language) || 0) + 1);
			}
		}
		const topLangs = [...langCounts.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([lang]) => lang);

		ctx.github = {
			username: userRecord.githubUsername,
			bio: userRecord.githubBio,
			location: userRecord.githubLocation,
			followers: userRecord.githubFollowers ?? undefined,
			following: userRecord.githubFollowing ?? undefined,
			publicRepos: userRecord.githubPublicRepos ?? undefined,
			totalStars,
			topLanguages: topLangs.join(", ") || "none",
			repoCount: repositories.length,
		};
	}

	if (latestSkillGap) {
		ctx.skillGap = {
			goal: latestSkillGap.goal,
			matchScore: latestSkillGap.matchScore,
			strong: latestSkillGap.strong,
			weak: latestSkillGap.weak,
			improving: latestSkillGap.improving,
			coach: latestSkillGap.coach,
			roadmap: latestSkillGap.roadmap as { step: string; details: string; duration: string }[],
		};
	}

	if (latestAssessment) {
		ctx.assessment = { latestScore: latestAssessment.score };
	}

	return formatSystemPrompt(ctx);
}

function formatSystemPrompt(ctx: UserContext): string {
	const goal = ctx.careerGoal || "a tech career";
	const skills = ctx.skills && ctx.skills.length > 0 ? ctx.skills.join(", ") : "not yet identified";

	let resumeSection = "";
	if (ctx.resumeData) {
		const r = ctx.resumeData;
		resumeSection = `
## Your Resume Analysis
- Resume Score: ${r.resumeScore ?? "N/A"} / 100
- ${r.strengths?.length ? `Strengths: ${r.strengths.join(", ")}` : ""}
- ${r.improvements?.length ? `Improvements Needed: ${r.improvements.join(", ")}` : ""}
- ${r.experience?.length ? `Work Experience: ${r.experience.map((e) => `${e.role} @ ${e.company} (${e.duration})`).join(" | ")}` : ""}
- ${r.education?.length ? `Education: ${r.education.map((e) => `${e.degree} @ ${e.school} (${e.year})`).join(" | ")}` : ""}
- ${r.summary ? `Summary: ${r.summary}` : ""}
- ${r.careerFit ? `Career Fit: ${r.careerFit.score}/100 - ${r.careerFit.summary}` : ""}
- Soft Skills: ${r.softSkills?.join(", ") || "none identified"}`;
	}

	let githubSection = "";
	if (ctx.github?.username) {
		const g = ctx.github;
		githubSection = `
## Your GitHub Profile
- Username: ${g.username}
- ${g.bio ? `Bio: ${g.bio}` : ""}
- ${g.location ? `Location: ${g.location}` : ""}
- Followers: ${g.followers ?? 0} | Following: ${g.following ?? 0}
- Public Repos: ${g.publicRepos ?? 0} | Synced Repos: ${g.repoCount ?? 0} | Total Stars: ${g.totalStars ?? 0}
- Top Languages: ${g.topLanguages || "none"}`;
	}

	let skillGapSection = "";
	if (ctx.skillGap) {
		const s = ctx.skillGap;
		skillGapSection = `
## Your Skill Gap Analysis
- Target Role: ${s.goal || goal}
- Overall Match: ${s.matchScore ?? 0}%
- ${s.strong?.length ? `Strong Areas: ${s.strong.join(", ")}` : ""}
- ${s.improving?.length ? `Developing: ${s.improving.join(", ")}` : ""}
- ${s.weak?.length ? `Gaps to Fill: ${s.weak.join(", ")}` : ""}
- AI Coach Notes: ${s.coach || "Run an analysis to get coaching."}
- ${s.roadmap?.length ? `Learning Roadmap: ${s.roadmap.map((r) => `${r.step} (${r.duration})`).join(" → ")}` : ""}`;
	}

	let assessmentSection = "";
	if (ctx.assessment?.latestScore !== undefined && ctx.assessment.latestScore !== null) {
		assessmentSection = `
## Assessment Progress
- Latest Interview Readiness: ${ctx.assessment.latestScore}%`;
	}

	return `You are an AI Career Coach for the LearnFlow platform. Your name is "LearnFlow Coach".

You provide personalized career guidance based on the user's actual profile data below. Always reference their specific skills, gaps, and progress. Give concrete, tailored advice — never generic.

CORE PROFILE:
- Name: ${ctx.fullName || "User"}
- Career Goal: ${goal}
- Identified Skills: ${skills}
${resumeSection}
${githubSection}
${skillGapSection}
${assessmentSection}

Guidelines:
- Be concise, practical, and encouraging
- Reference the user's actual resume, GitHub, and skill gap data when answering
- Give specific, actionable advice based on their weak skills and career goal
- If asked about something outside career coaching, politely redirect
- Keep responses under 500 words unless analysis is needed
- Format responses with clear sections when helpful (use markdown)`;
}

async function callChatGemini(
	messages: { role: "user" | "assistant"; content: string }[],
	systemPrompt: string,
): Promise<string | null> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey || apiKey === "your_gemini_api_key") return null;

	try {
		const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

		const contents = [
			{ role: "user", parts: [{ text: systemPrompt }] },
			...messages.map((m) => ({
				role: m.role === "assistant" ? "model" : "user",
				parts: [{ text: m.content }],
			})),
		];

		const response = await axios.post(
			url,
			{ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 2048 } },
			{ headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, timeout: AI_TIMEOUT_MS },
		);

		const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
		return text || null;
	} catch (err) {
		console.error("Chat Gemini call failed:", err instanceof Error ? err.message : String(err));
		return null;
	}
}

async function callChatGroq(
	messages: { role: "user" | "assistant"; content: string }[],
	systemPrompt: string,
): Promise<string | null> {
	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey || apiKey === "your_groq_api_key") return null;

	try {
		const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
		const response = await axios.post(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				model,
				messages: [
					{ role: "system", content: systemPrompt },
					...messages.map((m) => ({ role: m.role, content: m.content })),
				],
				temperature: 0.7,
				max_tokens: 2048,
			},
			{
				headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
				timeout: AI_TIMEOUT_MS,
			},
		);

		const text = response.data?.choices?.[0]?.message?.content;
		return text || null;
	} catch (err) {
		console.error("Chat Groq call failed:", err instanceof Error ? err.message : String(err));
		return null;
	}
}

async function callChatGithub(
	messages: { role: "user" | "assistant"; content: string }[],
	systemPrompt: string,
): Promise<string | null> {
	const apiKey = process.env.GITHUB_TOKEN;
	if (!apiKey || apiKey === "your_github_token") return null;

	try {
		const response = await axios.post(
			"https://models.inference.ai.azure.com/chat/completions",
			{
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					...messages.map((m) => ({ role: m.role, content: m.content })),
				],
				temperature: 0.7,
				max_tokens: 2048,
			},
			{
				headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
				timeout: AI_TIMEOUT_MS,
			},
		);

		const text = response.data?.choices?.[0]?.message?.content;
		return text || null;
	} catch (err) {
		console.error("Chat GitHub call failed:", err instanceof Error ? err.message : String(err));
		return null;
	}
}

async function generateReply(
	messages: { role: "user" | "assistant"; content: string }[],
	systemPrompt: string,
): Promise<string> {
	const geminiResult = await callChatGemini(messages, systemPrompt);
	if (geminiResult) return geminiResult;

	const groqResult = await callChatGroq(messages, systemPrompt);
	if (groqResult) return groqResult;

	const githubResult = await callChatGithub(messages, systemPrompt);
	if (githubResult) return githubResult;

	throw new AppError("All AI providers are currently unavailable. Please try again later.", 503);
}

export async function getOrCreateSession(userId: string, title?: string) {
	const session = await prisma.chatSession.create({
		data: { userId, title: title || "Chat" },
	});
	return session;
}

export async function getUserSessions(userId: string) {
	const sessions = await prisma.chatSession.findMany({
		where: { userId },
		include: {
			_count: { select: { messages: true } },
			messages: { orderBy: { createdAt: "desc" }, take: 1 },
		},
		orderBy: { updatedAt: "desc" },
	});

	return sessions.map((s) => ({
		id: s.id,
		title: s.title,
		messageCount: s._count.messages,
		lastMessageAt: s.messages[0]?.createdAt.toISOString() || s.createdAt.toISOString(),
		createdAt: s.createdAt.toISOString(),
	}));
}

export async function getSessionMessages(userId: string, sessionId: string) {
	const session = await prisma.chatSession.findUnique({
		where: { id: sessionId },
		select: { userId: true },
	});

	if (!session || session.userId !== userId) {
		throw new AppError("Session not found", 404);
	}

	const messages = await prisma.chatMessage.findMany({
		where: { sessionId },
		orderBy: { createdAt: "asc" },
	});

	return messages.map((m) => ({
		id: m.id,
		sessionId: m.sessionId,
		role: m.role as "user" | "assistant",
		content: m.content,
		createdAt: m.createdAt.toISOString(),
	}));
}

function cleanBase64(s: string): string {
	return s.includes(";base64,") ? s.split(";base64,")[1] : s;
}

async function extractTextFromBase64(base64: string, mimeType: string): Promise<string> {
	const mime = mimeType.toLowerCase();
	const buffer = Buffer.from(cleanBase64(base64), "base64");

	if (mime.includes("pdf")) {
		try {
			const pdf = new PDFParse({ verbosity: VerbosityLevel.ERRORS, data: buffer });
			await pdf.load();
			const result = await pdf.getText();
			const text = result.text || "";
			return text.trim() || "No text could be extracted from the PDF.";
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error("PDF extraction failed:", msg);
			return `[Could not extract text from PDF: ${msg}]`;
		}
	}

	if (mime.includes("text") || mime === "application/json") {
		return buffer.toString("utf-8").trim() || "[Empty file]";
	}

	if (mime.includes("image")) {
		return "[Image file uploaded - describe what you see or ask a question about it]";
	}

	return `[File uploaded with type: ${mimeType}]`;
}

export async function sendMessage(
	userId: string,
	sessionId: string,
	content: string,
	fileData?: { base64: string; mimeType: string; fileName: string } | null,
) {
	const session = await prisma.chatSession.findUnique({
		where: { id: sessionId },
		select: { userId: true, title: true },
	});

	if (!session || session.userId !== userId) {
		throw new AppError("Session not found", 404);
	}

	let messageContent = content;

	if (fileData) {
		const extractedText = await extractTextFromBase64(fileData.base64, fileData.mimeType);
		messageContent = `${content}\n\n--- Uploaded File: ${fileData.fileName} ---\n${extractedText}\n--- End of File ---`;
	}

	const userMessage = await prisma.chatMessage.create({
		data: { sessionId, role: "user", content: messageContent },
	});

	const systemPrompt = await buildRichSystemPrompt(userId);

	const history = await prisma.chatMessage.findMany({
		where: { sessionId },
		orderBy: { createdAt: "asc" },
	});

	const chatHistory = history.map((m) => ({
		role: m.role as "user" | "assistant",
		content: m.content,
	}));

	const replyText = await generateReply(chatHistory, systemPrompt);

	const assistantMessage = await prisma.chatMessage.create({
		data: { sessionId, role: "assistant", content: replyText },
	});

	if (session.title === "Chat" && content.length > 0) {
		const inferredTitle = content.slice(0, 80) + (content.length > 80 ? "..." : "");
		await prisma.chatSession.update({
			where: { id: sessionId },
			data: { title: inferredTitle },
		});
	} else {
		await prisma.chatSession.update({
			where: { id: sessionId },
			data: {},
		});
	}

	return {
		message: {
			id: userMessage.id,
			sessionId: userMessage.sessionId,
			role: "user" as const,
			content: userMessage.content,
			createdAt: userMessage.createdAt.toISOString(),
		},
		reply: {
			id: assistantMessage.id,
			sessionId: assistantMessage.sessionId,
			role: "assistant" as const,
			content: assistantMessage.content,
			createdAt: assistantMessage.createdAt.toISOString(),
		},
	};
}

export async function deleteSession(userId: string, sessionId: string) {
	const session = await prisma.chatSession.findUnique({
		where: { id: sessionId },
		select: { userId: true },
	});

	if (!session || session.userId !== userId) {
		throw new AppError("Session not found", 404);
	}

	await prisma.chatSession.delete({ where: { id: sessionId } });
}


