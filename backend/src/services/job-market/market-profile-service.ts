import type { Prisma } from "@prisma/client";
import { prisma } from "@/database";
import {
	CAREER_GOAL_PROFILES,
	getCareerProfile,
} from "@/features/skill-gap-analysis/services/career-goals-service";
import type {
	WeightedSkill,
} from "@/features/skill-gap-analysis/types/skill-gap.types";
import { generateEmbedding } from "@/services/rag/embedding";
import { storeVectors, VECTOR_COLLECTIONS } from "@/services/rag/vector-store";
import type { GeneratedJobPosting } from "./job-posting-generator";
const MARKET_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface MarketProfileData {
	careerGoal: string;
	weightedSkills: WeightedSkill[];
	coreSkills: string[];
	tools: string[];
	topCompanies: string[];
	seniorityDistribution: { junior: number; mid: number; senior: number };
}

export function aggregatePostingsIntoProfile(
	careerGoal: string,
	postings: GeneratedJobPosting[],
): MarketProfileData {
	const skillFrequency = new Map<string, { count: number; seniority: Set<string> }>();
	const companies = new Set<string>();
	const seniorityCounts = { junior: 0, mid: 0, senior: 0 };

	for (const p of postings) {
		if (p.company) companies.add(p.company);
		if (p.seniority) seniorityCounts[p.seniority]++;

		for (const skill of p.requiredSkills) {
			const norm = skill.trim();
			if (!norm) continue;
			const existing = skillFrequency.get(norm) || { count: 0, seniority: new Set() };
			existing.count++;
			if (p.seniority) existing.seniority.add(p.seniority);
			skillFrequency.set(norm, existing);
		}
		for (const skill of p.niceToHaveSkills) {
			const norm = skill.trim();
			if (!norm) continue;
			const existing = skillFrequency.get(norm) || { count: 0, seniority: new Set() };
			existing.count++;
			if (p.seniority) existing.seniority.add(p.seniority);
			skillFrequency.set(norm, existing);
		}
	}

	const maxFreq = Math.max(...Array.from(skillFrequency.values()).map((s) => s.count), 1);
	const weightedSkills: WeightedSkill[] = Array.from(skillFrequency.entries())
		.map(([name, info]) => {
			let category: "core" | "tool" | "soft" = "tool";
			const staticProfile = CAREER_GOAL_PROFILES[careerGoal as keyof typeof CAREER_GOAL_PROFILES];
			if (staticProfile) {
				if (staticProfile.coreSkills.some((s) => s.toLowerCase() === name.toLowerCase())) {
					category = "core";
				} else if (staticProfile.softSkills.some((s) => s.toLowerCase() === name.toLowerCase())) {
					category = "soft";
				}
			}
			return {
				name,
				weight: Math.max(1, Math.round((info.count / maxFreq) * 10)),
				category,
			};
		})
		.sort((a, b) => b.weight - a.weight)
		.slice(0, 25);

	const coreSkills = [
		...new Set(
			weightedSkills
				.filter((s) => s.category === "core")
				.map((s) => s.name),
		),
	];
	const tools = [
		...new Set(
			weightedSkills
				.filter((s) => s.category === "tool")
				.map((s) => s.name),
		),
	];

	return {
		careerGoal,
		weightedSkills,
		coreSkills,
		tools,
		topCompanies: Array.from(companies).slice(0, 10),
		seniorityDistribution: seniorityCounts,
	};
}

export function mergeProfiles(
	marketProfile: MarketProfileData,
	careerGoal: string,
): {
	weightedSkills: WeightedSkill[];
	coreSkills: string[];
	tools: string[];
} {
	const staticProfile = getCareerProfile(careerGoal);
	const staticWeights = new Map(
		staticProfile.weightedSkills.map((ws) => [ws.name.toLowerCase(), ws.weight]),
	);
	const marketWeightMap = new Map(
		marketProfile.weightedSkills.map((ws) => [ws.name.toLowerCase(), ws]),
	);

	const seen = new Set<string>();
	const merged: WeightedSkill[] = [];

	for (const ms of marketProfile.weightedSkills) {
		const key = ms.name.toLowerCase();
		const staticWeight = staticWeights.get(key) || 0;
		const marketWeight = ms.weight;

		const blended = Math.round(staticWeight * 0.4 + marketWeight * 0.6);
		merged.push({
			name: ms.name,
			weight: Math.max(1, Math.min(10, blended)),
			category: ms.category,
		});
		seen.add(key);
	}

	for (const ws of staticProfile.weightedSkills) {
		const key = ws.name.toLowerCase();
		if (!seen.has(key)) {
			merged.push({
				name: ws.name,
				weight: Math.round(ws.weight * 0.4),
				category: ws.category,
			});
		}
		seen.add(key);
	}

	merged.sort((a, b) => b.weight - a.weight);

	const coreSkills = [
		...new Set(
			merged
				.filter((s) => s.category === "core")
				.map((s) => s.name),
		),
	];
	const tools = [
		...new Set(
			merged
				.filter((s) => s.category === "tool")
				.map((s) => s.name),
		),
	];

	return { weightedSkills: merged, coreSkills, tools };
}

export async function getMarketProfile(
	careerGoal: string,
): Promise<MarketProfileData | null> {
	const cached = await prisma.marketProfile.findUnique({
		where: { careerGoal },
	});

	if (cached) {
		const expiresAt = cached.expiresAt
			? new Date(cached.expiresAt).getTime()
			: new Date(cached.fetchedAt).getTime() + MARKET_CACHE_TTL_MS;
		if (Date.now() < expiresAt) {
			return {
				careerGoal: cached.careerGoal,
				weightedSkills: JSON.parse(JSON.stringify(cached.weightedSkills)) as WeightedSkill[],
				coreSkills: (JSON.parse(JSON.stringify(cached.weightedSkills)) as WeightedSkill[])
					.filter((s) => s.category === "core")
					.map((s) => s.name),
				tools: (JSON.parse(JSON.stringify(cached.weightedSkills)) as WeightedSkill[])
					.filter((s) => s.category === "tool")
					.map((s) => s.name),
				topCompanies: cached.topCompanies as string[],
				seniorityDistribution: { junior: 0, mid: 0, senior: 0 },
			};
		}
	}

	return null;
}

export async function saveMarketProfile(
	data: MarketProfileData,
): Promise<void> {
	const expiresAt = new Date(Date.now() + MARKET_CACHE_TTL_MS);

	await prisma.marketProfile.upsert({
		where: { careerGoal: data.careerGoal },
		update: {
			weightedSkills: data.weightedSkills as unknown as Prisma.InputJsonValue,
			topCompanies: data.topCompanies,
			expiresAt,
			fetchedAt: new Date(),
		},
		create: {
			careerGoal: data.careerGoal,
			weightedSkills: data.weightedSkills as unknown as Prisma.InputJsonValue,
			topCompanies: data.topCompanies,
			expiresAt,
		},
	});
}

export async function saveJobPostings(
	careerGoal: string,
	postings: GeneratedJobPosting[],
): Promise<void> {
	await prisma.jobPosting.deleteMany({ where: { careerGoal } });
	await prisma.jobPosting.createMany({
		data: postings.map((p) => ({
			careerGoal,
			title: p.title,
			company: p.company,
			seniority: p.seniority,
			requiredSkills: p.requiredSkills as unknown as Prisma.InputJsonValue,
			niceToHaveSkills: p.niceToHaveSkills as unknown as Prisma.InputJsonValue,
		})),
	});
}

export async function storePostingsAsVectors(
	careerGoal: string,
	postings: GeneratedJobPosting[],
): Promise<void> {
	for (const posting of postings) {
		const content = `${posting.title}. Required: ${posting.requiredSkills.join(", ")}. Nice-to-have: ${posting.niceToHaveSkills.join(", ")}`;
		const embedding = await generateEmbedding(content);
		if (!embedding) continue;

		const id = `market_${careerGoal.replace(/\s+/g, "_")}_${posting.company.replace(/\s+/g, "_")}_${Date.now()}`;
		await storeVectors(VECTOR_COLLECTIONS.JOB_REQUIREMENTS, [
			{
				id,
				title: posting.title,
				content,
				embedding,
				metadata: {
					careerGoal,
					company: posting.company,
					seniority: posting.seniority,
					requiredSkills: posting.requiredSkills,
					niceToHaveSkills: posting.niceToHaveSkills,
				},
			},
		]);
	}
}
