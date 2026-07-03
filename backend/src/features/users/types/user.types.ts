import type { Repository, User } from "@prisma/client";

export interface UserProfile extends User {
	repositories: Repository[];
}

export interface DashboardData {
	user: {
		id: string;
		username: string | null;
		email: string;
		fullName: string | null;
		avatarUrl: string | null;
		careerGoal: string | null;
		skills: string[];
	};
	resume: {
		hasResume: boolean;
		score: number | null;
		careerFitScore: number | null;
		skillCount: number;
		summary: string | null;
		strengths: string[];
	};
	skillGap: {
		goal: string;
		matchScore: number;
		strong: string[];
		improving: string[];
		weak: string[];
		coach: string;
		roadmap: { step: string; details: string; duration: string }[];
	} | null;
	assessment: {
		latestScore: number | null;
		hasTaken: boolean;
	};
	github: {
		totalRepositories: number;
		totalStars: number;
		topLanguage: string;
		score: number;
	};
	stats: {
		resumeScore: number;
		githubScore: number;
		matchScore: number;
		interviewReady: number;
	};
	currentMission: { step: string; details: string; duration: string } | null;
	roadmapPreview: { step: string; details: string; duration: string }[];
}

export interface GithubStats {
	totalRepositories: number;
	totalStars: number;
	mostUsedLanguage: string;
	score: number;
	missingSkills: string[];
	matchedSkills: string[];
	repoSkills: string[];
	languages: { name: string; count: number; percentage: number }[];
	recommendations: string;
	careerGoal: string;
}

export interface GithubAnalysisResponse {
	languages: { name: string; count: number; percentage: number }[];
	stats: {
		totalRepositories: number;
		totalStars: number;
		mostUsedLanguage: string;
	};
	analysis: {
		score: number;
		missingSkills: string[];
		matchedSkills: string[];
		careerGoal: string;
		recommendations: string;
	};
}

export interface SyncGithubResponse {
	user: UserProfile | null;
	githubUsername: string;
	repositoriesSynced: number;
}
