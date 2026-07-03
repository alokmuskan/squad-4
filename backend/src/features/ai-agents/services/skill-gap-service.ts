import {
	applySkillGapScores,
	buildMockSkillGap,
} from "@/features/skill-gap-analysis/services/analysis-service";
import {
	inferExperienceLevel,
	inferSkillsFromRepos,
} from "@/features/skill-gap-analysis/services/career-goals-service";
import { callAI } from "@/services/ai-service";
import { prisma } from "@/database";
import type { AgentState } from "@/features/ai-agents/types/agent.types";
import { buildRagSkillGapPrompt } from "@/services/rag/prompts";
import { retrieveJobRequirements } from "@/services/rag/retrievers";

function levelToSeniority(level: string): string {
	if (level === "fresher") return "junior";
	return level;
}

export async function skillGapAnalysisNode(
	state: AgentState,
): Promise<Partial<AgentState>> {
	try {
		const skills = state.aggregatedSkills;
		if (skills.length === 0) {
			return {
				skillGapResult: buildMockSkillGap(
					[],
					state.careerGoal,
					state.aggregatedExperience,
				),
			};
		}

		const [repos, seniorityPostings] = await Promise.all([
			prisma.repository.findMany({
				where: { userId: state.userId },
				select: { language: true, name: true, description: true },
			}),
			prisma.jobPosting.findMany({
				where: { careerGoal: state.careerGoal, seniority: levelToSeniority(inferExperienceLevel(state.aggregatedExperience)) },
				select: { requiredSkills: true, niceToHaveSkills: true },
			}),
		]);

		const repoSkills = inferSkillsFromRepos(repos);

		const seniorityPostingSkills = new Set<string>();
		for (const p of seniorityPostings) {
			const required = p.requiredSkills as string[];
			const niceToHave = p.niceToHaveSkills as string[];
			for (const s of required) seniorityPostingSkills.add(s);
			for (const s of niceToHave) seniorityPostingSkills.add(s);
		}

		const jobContext = await retrieveJobRequirements(state.careerGoal);
		const prompt = buildRagSkillGapPrompt(state.careerGoal, skills, jobContext);
		const aiResult = await callAI(prompt);

		if (aiResult) {
			return {
				skillGapResult: applySkillGapScores(
					aiResult,
					skills,
					state.careerGoal,
					state.aggregatedExperience,
					state.aggregatedEducation,
					undefined,
					undefined,
					repoSkills,
					seniorityPostingSkills,
				),
			};
		}

		return {
			skillGapResult: buildMockSkillGap(
				skills,
				state.careerGoal,
				state.aggregatedExperience,
				state.aggregatedEducation,
				undefined,
				undefined,
				repoSkills,
				seniorityPostingSkills,
			),
		};
	} catch (err: unknown) {
		console.error(
			"Skill gap agent failed:",
			err instanceof Error ? err.message : String(err),
		);
		return {
			skillGapResult: buildMockSkillGap(
				state.aggregatedSkills,
				state.careerGoal,
				state.aggregatedExperience,
			),
		};
	}
}
