import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { env } from "@/config/env";
import { prisma } from "@/database";

const frontendUrl = env.FRONTEND_URL || "http://localhost:5173";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
		usePlural: false,
	}),
	plugins: [bearer()],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID || "",
			clientSecret: env.GOOGLE_CLIENT_SECRET || "",
		},
		github: {
			clientId: env.GITHUB_CLIENT_ID || "",
			clientSecret: env.GITHUB_CLIENT_SECRET || "",
		},
	},
	trustedOrigins: [frontendUrl],
	account: {
		accountLinking: {
			requireLocalEmailVerified: false,
		},
	},
	session: {
		expiresIn: 7 * 24 * 60 * 60,
		updateAge: 24 * 60 * 60,
	},
	user: {
		fields: {
			name: "fullName",
			image: "avatarUrl",
		},
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "user",
			},
		},
	},
});
