export interface ResumeAnalysisResult {
	skills: string[];
	softSkills: string[];
	experience: { role: string; company: string; duration: string }[];
	education: { degree: string; school: string; year: string }[];
	summary: string;
	resumeScore: number;
	strengths: string[];
	improvements: string[];
	atsTips: string[];
	careerFit: { score: number; summary: string };
}

export interface SkillGapAnalysisResult {
	matchScore: number;
	strong: string[];
	improving: string[];
	weak: string[];
	gapPriority: Record<string, "now" | "later">;
	priorityGaps: {
		skill: string;
		importance: "high" | "medium" | "low";
		reason: string;
	}[];
	skillCategories: {
		core: { matched: string[]; missing: string[] };
		tools: { matched: string[]; missing: string[] };
		soft: { matched: string[]; missing: string[] };
	};
	roadmap: { step: string; details: string; duration: string }[];
	coach: string;
	timeToGoal: string;
	recommendedCertifications: string[];
	projectIdeas: string[];
	assessment: { question: string; options: string[]; answer: string }[];
}

export interface SkillGapRecord {
	id: string;
	userId: string;
	goal: string;
	matchScore: number;
	strong: string[];
	improving: string[];
	weak: string[];
	roadmap: unknown;
	coach: string;
	details: unknown | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface AssessmentRecord {
	id: string;
	userId: string;
	goal: string;
	questions: unknown;
	answers: unknown | null;
	score: number | null;
	createdAt: Date;
}

export interface WeightedSkill {
	name: string;
	weight: number;
	category: "core" | "tool" | "soft";
}

export interface MarketDerivedProfile {
	label: string;
	weightedSkills: WeightedSkill[];
	topCompanies: string[];
	source: "market" | "default";
}

export interface CompanyMatch {
	company: string;
	title: string;
	matchScore: number;
	matchedSkills: string[];
	missingSkills: string[];
	salary: string;
	location: string;
	seniority: string;
}

export interface AnalyzeSkillGapResponse {
	skillGap: SkillGapRecord;
	assessmentId: string;
	questions: unknown;
}

export interface LatestSkillGapResponse {
	skillGap: SkillGapRecord | null;
	careerGoal: string | null;
	skills: string[];
	activeAssessmentId: string | null;
	questions: unknown | null;
	latestScore: number | null;
	message?: string;
}
