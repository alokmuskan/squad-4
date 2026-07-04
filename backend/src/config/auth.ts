import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { env } from "./env";
import { prisma } from "../database";

// Fallback safely to your live Vercel production frontend link
const frontendUrl = "https://learnflow-frontend-indol.vercel.app";

// In production, Better-Auth baseURL MUST point directly to your Render backend link
const backendUrl = process.env.NODE_ENV === "production" 
    ? "https://squad-4.onrender.com" 
    : `http://localhost:${env.PORT || 5001}`;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
        usePlural: false,
    }),
    baseURL: backendUrl,
    
    // FIXED: Changed cookie attributes to 'none' and secure to true so cookies pass between Vercel and Render
    advanced: {
        crossSubDomainCookies: {
            enabled: true,
        },
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        }
    },
    
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
    // Whitelist your live Vercel domain as a trusted source for authentication handlers
    trustedOrigins: [frontendUrl, "http://localhost:5173"],
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