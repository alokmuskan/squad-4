import type {
	ResumeAnalysisResult,
	SkillGapAnalysisResult,
} from "@/features/skill-gap-analysis/types/skill-gap.types";

export interface ResourceRecommendation {
	skill: string;
	title: string;
	url: string;
	platform: string;
	type: string;
	difficulty: string;
	duration: string;
	reason: string;
}

export interface AgentState {
	userId: string;
	careerGoal: string;
	status: "pending" | "running" | "completed" | "error";

	resumeResult?: ResumeAnalysisResult | null;
	githubResult?: {
		repoSkills: string[];
		stats: Record<string, unknown>;
	} | null;

	aggregatedSkills: string[];
	aggregatedExperience: { role: string; company: string; duration: string }[];
	aggregatedEducation: { degree: string; school: string; year: string }[];

	skillGapResult?: SkillGapAnalysisResult | null;

	resourceRecommendations: ResourceRecommendation[];

	error?: string;
	snapshotId?: string;
}
