import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: Number(process.env.PORT) || 3000,
	DATABASE_URL: process.env.DATABASE_URL,
	BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
	GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	GEMINI_API_KEY: process.env.GEMINI_API_KEY,
	GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
	GROQ_API_KEY: process.env.GROQ_API_KEY,
	GROQ_MODEL: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
	FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
	PINECONE_API_KEY: process.env.PINECONE_API_KEY,
	PINECONE_INDEX: process.env.PINECONE_INDEX || "skill-gap",
};
