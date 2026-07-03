import axios from "axios";

const EMBEDDING_MODELS = ["text-embedding-004", "embedding-001", "gemini-embedding-exp-03-07"];

export async function generateEmbedding(
	text: string,
): Promise<number[] | null> {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey || apiKey === "your_gemini_api_key") return null;

	if (!text || text.trim().length === 0) return null;

	for (const model of EMBEDDING_MODELS) {
		try {
			const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
			const response = await axios.post(
				url,
				{ content: { parts: [{ text: text.slice(0, 2000) }] } },
				{ headers: { "Content-Type": "application/json" }, timeout: 15000 },
			);
			const values = response.data?.embedding?.values as number[];
			if (values && values.length > 0) return values;
		} catch {
			continue;
		}
	}

	return null;
}

