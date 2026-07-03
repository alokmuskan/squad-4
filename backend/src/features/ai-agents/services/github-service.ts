import { prisma } from "@/database";
import type { AgentState } from "@/features/ai-agents/types/agent.types";
import { computeGithubStats } from "./github-utils";

export async function githubAnalysisNode(
	state: AgentState,
): Promise<Partial<AgentState>> {
	if (state.githubResult) {
		return {};
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: state.userId },
			include: { repositories: true },
		});

		if (!user || user.repositories.length === 0) {
			return {};
		}

		const stats = computeGithubStats(user.repositories);
		const repoSkills = extractSkillsFromRepos(
			user.repositories,
			stats.topLanguages,
		);

		return {
			githubResult: { repoSkills, stats },
		};
	} catch (err: unknown) {
		console.error(
			"GitHub agent failed:",
			err instanceof Error ? err.message : String(err),
		);
		return {};
	}
}

function extractSkillsFromRepos(
	repos: {
		name: string;
		description: string | null;
		language: string | null;
	}[],
	topLanguages: string[],
): string[] {
	const skills = new Set<string>(topLanguages);

	const keywordEntries = Object.entries(REPO_KEYWORD_MAP);
	const scanned = new Set<string>();

	for (const repo of repos) {
		const text = [repo.name, repo.description || ""].join(" ").toLowerCase();
		if (scanned.has(text)) continue;
		scanned.add(text);

		for (const [keyword, skillTags] of keywordEntries) {
			if (text.includes(keyword)) {
				for (const tag of skillTags) {
					skills.add(tag);
				}
			}
		}

		if (skills.size >= 30) break;
	}

	return [...skills].slice(0, 30);
}

const REPO_KEYWORD_MAP: Record<string, string[]> = {
	typescript: ["TypeScript"],
	javascript: ["JavaScript"],
	python: ["Python"],
	java: ["Java"],
	go: ["Go"],
	rust: ["Rust"],
	cplusplus: ["C++"],
	csharp: ["C#"],
	react: ["React"],
	angular: ["Angular"],
	vue: ["Vue.js"],
	nextjs: ["Next.js"],
	node: ["Node.js"],
	express: ["Express"],
	django: ["Django"],
	flask: ["Flask"],
	fastapi: ["FastAPI"],
	tensorflow: ["TensorFlow"],
	pytorch: ["PyTorch"],
	machine: ["Machine Learning"],
	deep: ["Deep Learning"],
	ai: ["Machine Learning"],
	nlp: ["NLP"],
	docker: ["Docker"],
	kubernetes: ["Kubernetes"],
	aws: ["AWS"],
	azure: ["Azure"],
	gcp: ["GCP"],
	terraform: ["Terraform"],
	graphql: ["GraphQL"],
	api: ["REST APIs"],
	sql: ["SQL"],
	mongodb: ["MongoDB"],
	postgres: ["PostgreSQL"],
	redis: ["Redis"],
	kafka: ["Kafka"],
	ci: ["CI/CD"],
	pipeline: ["CI/CD"],
	test: ["Testing"],
	blockchain: ["Blockchain"],
	mobile: ["Mobile Development"],
	reactnative: ["React Native"],
	flutter: ["Flutter"],
};
