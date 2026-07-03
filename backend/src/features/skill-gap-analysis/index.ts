export {
	analyzeResumeController,
	analyzeSkillGapController,
	getLatestSkillGapController,
} from "./controllers/skill-gap-controller";
export { default as skillGapRoutes } from "./routes/skill-gap-routes";
export {
	analyzeResumeSchema,
	analyzeSkillGapSchema,
} from "./schemas/skill-gap-schema";
export {
	applyResumeScores,
	applySkillGapScores,
	buildMockResumeAnalysis,
	buildMockSkillGap,
	buildResumeAnalysisPrompt,
	buildSkillGapAnalysisPrompt,
} from "./services/analysis-service";
export {
	CAREER_GOAL_PROFILES,
	CAREER_GOALS,
	categorizeSkillsForGoal,
	computeMatchScore,
	getCareerProfile,
} from "./services/career-goals-service";
export {
	computeGithubStats,
	extractSkillsFromRepos,
} from "./services/github-analysis-service";
export {
	isValidGithubUsername,
	syncUserGithubRepos,
} from "./services/github-service";
export type {
	AnalyzeSkillGapResponse,
	AssessmentRecord,
	LatestSkillGapResponse,
	ResumeAnalysisResult,
	SkillGapAnalysisResult,
	SkillGapRecord,
} from "./types/skill-gap.types";
