import { resolveAliases } from "@/utils/skill-matching";
import { generateEmbedding } from "./embedding";
import { queryVectors, VECTOR_COLLECTIONS } from "./vector-store";

const jobRequirementCache = new Map<
	string,
	{ data: string[]; expiry: number }
>();
const CACHE_TTL_MS = 30 * 60 * 1000;

export async function retrieveJobRequirements(
	careerGoal: string,
	topK = 3,
): Promise<string[]> {
	const cached = jobRequirementCache.get(careerGoal);
	if (cached && cached.expiry > Date.now()) {
		return cached.data;
	}

	const embedding = await generateEmbedding(careerGoal);
	if (!embedding) return [];

	const results = await queryVectors(
		VECTOR_COLLECTIONS.JOB_REQUIREMENTS,
		embedding,
		topK,
		{
			careerGoal,
		},
	);

	const data = results.map((r) => `Role: ${r.title}\n${r.content}`);
	jobRequirementCache.set(careerGoal, {
		data,
		expiry: Date.now() + CACHE_TTL_MS,
	});
	return data;
}

export async function retrieveLearningResources(
	skill: string,
	topK = 3,
	filters?: { difficulty?: string; platform?: string; type?: string },
): Promise<
	{
		title: string;
		url: string;
		platform: string;
		type: string;
		difficulty: string;
		reason: string;
	}[]
> {
	const embedding = await generateEmbedding(skill);
	if (!embedding) return [];

	const filter: Record<string, unknown> = { skill };
	if (filters?.difficulty) filter.difficulty = filters.difficulty;
	if (filters?.platform) filter.platform = filters.platform;
	if (filters?.type) filter.type = filters.type;

	const results = await queryVectors(
		VECTOR_COLLECTIONS.LEARNING_RESOURCES,
		embedding,
		topK,
		filter,
	);

	return results.map((r) => ({
		title: r.title,
		url: (r.metadata?.url as string) || "",
		platform: (r.metadata?.platform as string) || "Web",
		type: (r.metadata?.type as string) || "article",
		difficulty: (r.metadata?.difficulty as string) || "intermediate",
		reason:
			(r.metadata?.reason as string) || `Relevant to building ${skill} skills`,
	}));
}

export async function retrieveJobPostings(
	careerGoal: string,
	limit = 10,
): Promise<
	{
		title: string;
		content: string;
		metadata: {
			careerGoal: string;
			company: string;
			seniority: string;
			requiredSkills: string[];
			niceToHaveSkills: string[];
		};
	}[]
> {
	const embedding = await generateEmbedding(careerGoal);
	if (!embedding) return [];

	const results = await queryVectors(
		VECTOR_COLLECTIONS.JOB_REQUIREMENTS,
		embedding,
		limit,
		{ careerGoal },
	);

	return results.map((r) => ({
		title: r.title,
		content: r.content,
		metadata: {
			careerGoal: r.metadata?.careerGoal as string || careerGoal,
			company: r.metadata?.company as string || "Unknown",
			seniority: r.metadata?.seniority as string || "mid",
			requiredSkills: (r.metadata?.requiredSkills as string[]) || [],
			niceToHaveSkills: (r.metadata?.niceToHaveSkills as string[]) || [],
		},
	}));
}

export async function retrieveJobPostingsForUser(
	userSkills: string[],
	careerGoal: string,
	limit = 20,
): Promise<
	{
		title: string;
		company: string;
		seniority: string;
		location: string;
		matchScore: number;
		matchedSkills: string[];
		missingSkills: string[];
	}[]
> {
	userSkills = resolveAliases(userSkills);
	const embedding = await generateEmbedding(
		`${careerGoal} ${userSkills.join(" ")}`,
	);
	if (!embedding) return [];

	const results = await queryVectors(
		VECTOR_COLLECTIONS.JOB_REQUIREMENTS,
		embedding,
		limit,
		{ careerGoal },
	);

	return results.map((r) => {
		const required = (r.metadata?.requiredSkills as string[]) || [];
		const matched = required.filter((s) =>
			userSkills.some((us) =>
				us.toLowerCase() === s.toLowerCase(),
			),
		);
		const matchScore = required.length > 0
			? Math.round((matched.length / required.length) * 100)
			: 0;

		return {
			title: r.title,
			company: (r.metadata?.company as string) || "Unknown",
			seniority: (r.metadata?.seniority as string) || "mid",
			location: (r.metadata?.location as string) || "Remote",
			matchScore,
			matchedSkills: matched,
			missingSkills: required.filter((s) => !matched.includes(s)),
		};
	}).sort((a, b) => b.matchScore - a.matchScore);
}
