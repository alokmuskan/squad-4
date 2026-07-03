import axios from "axios";
import type { AxiosError } from "axios";
const { PDFParse, VerbosityLevel } = require("pdf-parse");

// --- RPM / rate limit tracking ---
const RPM_WINDOW_MS = 60_000;
const MAX_RPM = {
	gemini: 30,
	groq: 20,
	github: 60,
};

const providerCallTimestamps: Record<string, number[]> = {
	gemini: [],
	groq: [],
	github: [],
};

function checkRpm(provider: string): boolean {
	const now = Date.now();
	const window = RPM_WINDOW_MS;
	const max = MAX_RPM[provider as keyof typeof MAX_RPM] || 20;
	const timestamps = providerCallTimestamps[provider];
	if (!timestamps) return true;

	// Purge entries older than the window
	const cutoff = now - window;
	while (timestamps.length > 0 && timestamps[0] < cutoff) {
		timestamps.shift();
	}

	if (timestamps.length >= max) {
		console.warn(`RPM limit reached for ${provider} (${timestamps.length}/${max}) — skipping`);
		return false;
	}

	timestamps.push(now);
	return true;
}

// --- Global request queue (semaphore: 1 concurrent AI call) ---
let aiQueue: (() => void)[] = [];
let aiRunning = false;

async function acquire(): Promise<void> {
	if (!aiRunning) {
		aiRunning = true;
		return;
	}
	return new Promise((resolve) => {
		aiQueue.push(resolve);
	});
}

function release(): void {
	if (aiQueue.length > 0) {
		const next = aiQueue.shift()!;
		next();
	} else {
		aiRunning = false;
	}
}

// --- Delay helper ---
const INTER_CALL_DELAY_MS = 600;

function delay(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

let geminiFailing = false;
let geminiFailTime = 0;
const GEMINI_COOLDOWN_MS = 300_000;
const AI_TIMEOUT_MS = 60_000;

function cleanBase64(base64: string): string {
	return base64.includes(";base64,") ? base64.split(";base64,")[1] : base64;
}

function parseJsonResponse(text: string): Record<string, unknown> {
	const cleaned = text.trim();
	const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
	const jsonStr = jsonMatch ? jsonMatch[1].trim() : cleaned;
	const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
	if (typeof parsed !== "object" || parsed === null || Object.keys(parsed).length === 0) {
		throw new Error("Empty or invalid JSON response");
	}
	return parsed;
}

async function extractTextFromFile(fileData: {
	base64: string;
	mimeType: string;
}): Promise<string | null> {
	const mime = (fileData.mimeType || "application/pdf").toLowerCase();
	const buffer = Buffer.from(cleanBase64(fileData.base64), "base64");

	if (mime.includes("pdf")) {
		try {
			const pdf = new PDFParse({
				verbosity: VerbosityLevel.ERRORS,
				data: buffer,
			});
			await pdf.load();
			const pages = await pdf.getText();
			const text = Array.isArray(pages) ? pages.join("\n") : String(pages ?? "");
			return text.trim() || null;
		} catch (err: unknown) {
			console.error(
				"PDF text extraction failed:",
				err instanceof Error ? err.message : String(err),
			);
			return null;
		}
	}

	if (mime.includes("text") || mime === "application/json") {
		return buffer.toString("utf-8").trim() || null;
	}

	console.warn(`File extraction skipped: unsupported file type "${mime}" (use PDF)`);
	return null;
}

async function callGemini(
	prompt: string,
	fileData?: { base64: string; mimeType: string },
): Promise<Record<string, unknown> | null> {
	if (geminiFailing && Date.now() - geminiFailTime < GEMINI_COOLDOWN_MS) {
		return null;
	}

	if (!checkRpm("gemini")) return null;

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey || apiKey === "your_gemini_api_key") {
		return null;
	}

	try {
		const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
		const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
		const parts: (
			| { text: string }
			| { inlineData: { data: string; mimeType: string } }
		)[] = [{ text: prompt }];

		if (fileData) {
			parts.unshift({
				inlineData: {
					data: cleanBase64(fileData.base64),
					mimeType: fileData.mimeType,
				},
			});
		}

		const response = await axios.post(
			url,
			{
				contents: [{ parts }],
				generationConfig: { responseMimeType: "application/json" },
			},
			{ headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey }, timeout: AI_TIMEOUT_MS },
		);

		const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
		if (text) return parseJsonResponse(text);
	} catch (err: unknown) {
		const axiosErr = err as AxiosError;
		const status = axiosErr.response?.status;
		if (status === 429 || status === 503) {
			geminiFailing = true;
			geminiFailTime = Date.now();
			console.warn(`Gemini ${status} — cooling down for 5 min`);
		} else {
			console.error(
				"Gemini API call failed:",
				err instanceof Error ? err.message : String(err),
			);
		}
	}
	return null;
}

async function callGroq(
	prompt: string,
	fileText?: string,
): Promise<Record<string, unknown> | null> {
	if (!checkRpm("groq")) return null;

	const apiKey = process.env.GROQ_API_KEY;
	if (!apiKey || apiKey === "your_groq_api_key") {
		return null;
	}

	const model = process.env.GROQ_MODEL || "mixtral-8x7b-32768";
	const userContent = fileText
		? `${prompt}\n\n--- RESUME TEXT ---\n${fileText.slice(0, 14000)}`
		: prompt;

	try {
		const response = await axios.post(
			"https://api.groq.com/openai/v1/chat/completions",
			{
				model,
				messages: [
					{ role: "system", content: "You are a precise JSON generator. Always respond with valid JSON matching the requested schema exactly." },
					{ role: "user", content: userContent },
				],
				temperature: 0.2,
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				timeout: AI_TIMEOUT_MS,
			},
		);

		const text = response.data?.choices?.[0]?.message?.content;
		if (text) return parseJsonResponse(text);
	} catch (err: unknown) {
		console.error(
			"Groq API call failed:",
			err instanceof Error ? err.message : String(err),
		);
	}
	return null;
}

async function callGitHubModels(
	prompt: string,
): Promise<Record<string, unknown> | null> {
	if (!checkRpm("github")) return null;

	const apiKey = process.env.GITHUB_TOKEN;
	if (!apiKey || apiKey === "your_github_token") {
		return null;
	}

	try {
		const response = await axios.post(
			"https://models.inference.ai.azure.com/chat/completions",
			{
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: "You are a precise JSON generator. Always respond with valid JSON matching the requested schema exactly." },
					{ role: "user", content: prompt },
				],
				response_format: { type: "json_object" },
				temperature: 0.2,
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				timeout: AI_TIMEOUT_MS,
			},
		);

		const text = response.data?.choices?.[0]?.message?.content;
		if (text) return parseJsonResponse(text);
	} catch (err: unknown) {
		console.error(
			"GitHub Models API call failed:",
			err instanceof Error ? err.message : String(err),
		);
	}
	return null;
}

async function tryProvidersSequentially(
	prompt: string,
	fileData?: { base64: string; mimeType: string },
): Promise<Record<string, unknown> | null> {
	if (fileData) {
		const geminiResult = await callGemini(prompt, fileData);
		if (geminiResult) {
			console.log("AI response: Gemini");
			return geminiResult;
		}

		await delay(INTER_CALL_DELAY_MS);
		console.log("Gemini unavailable — trying Groq fallback...");
		const extracted = await extractTextFromFile(fileData);
		if (extracted) {
			const groqResult = await callGroq(prompt, extracted);
			if (groqResult) {
				console.log("AI response: Groq");
				return groqResult;
			}
		} else {
			console.warn("Groq fallback skipped: could not extract resume text");
		}

		await delay(INTER_CALL_DELAY_MS);
		if (extracted) {
			console.log("Groq unavailable — trying GitHub Models fallback...");
			const githubResult = await callGitHubModels(prompt);
			if (githubResult) {
				console.log("AI response: GitHub Models");
				return githubResult;
			}
		}
		return null;
	}

	const geminiResult = await callGemini(prompt);
	if (geminiResult) {
		console.log("AI response: Gemini");
		return geminiResult;
	}

	await delay(INTER_CALL_DELAY_MS);
	const groqResult = await callGroq(prompt);
	if (groqResult) {
		console.log("AI response: Groq");
		return groqResult;
	}

	await delay(INTER_CALL_DELAY_MS);
	const githubResult = await callGitHubModels(prompt);
	if (githubResult) {
		console.log("AI response: GitHub Models");
		return githubResult;
	}

	return null;
}

export async function callAI(
	prompt: string,
	fileData?: { base64: string; mimeType: string },
): Promise<Record<string, unknown> | null> {
	await acquire();
	try {
		return await tryProvidersSequentially(prompt, fileData);
	} finally {
		release();
	}
}
