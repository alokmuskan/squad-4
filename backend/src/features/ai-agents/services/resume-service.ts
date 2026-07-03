import {
	applyResumeScores,
	buildMockResumeAnalysis,
} from "@/features/skill-gap-analysis/services/analysis-service";
import { callAI } from "@/services/ai-service";
import type { AgentState } from "@/features/ai-agents/types/agent.types";
import { buildRagResumePrompt } from "@/services/rag/prompts";
import { retrieveJobRequirements } from "@/services/rag/retrievers";

export async function resumeAnalysisNode(
	state: AgentState,
): Promise<Partial<AgentState>> {
	if (state.resumeResult) {
		return {};
	}

	try {
		const jobContext = await retrieveJobRequirements(state.careerGoal);
		const prompt = buildRagResumePrompt(state.careerGoal, jobContext);
		const aiResult = await callAI(prompt);

		if (aiResult) {
			return {
				resumeResult: applyResumeScores(aiResult, state.careerGoal),
			};
		}

		return {
			resumeResult: buildMockResumeAnalysis(state.careerGoal),
		};
	} catch (err: unknown) {
		console.error(
			"Resume agent failed:",
			err instanceof Error ? err.message : String(err),
		);
		return {
			resumeResult: buildMockResumeAnalysis(state.careerGoal),
		};
	}
}
