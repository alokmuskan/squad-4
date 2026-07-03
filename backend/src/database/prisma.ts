import { PrismaClient } from "@prisma/client";
import { env } from "@/config/env";

export const prisma = new PrismaClient();

export async function initDb() {
	if (!env.DATABASE_URL) {
		console.error("DATABASE_URL is required. Set it in backend/.env");
		process.exit(1);
	}

	try {
		await prisma.$connect();
		console.log("Connected to PostgreSQL via Prisma");
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Unknown error";
		console.error("Failed to connect to PostgreSQL:", message);
		process.exit(1);
	}
}
