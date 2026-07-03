import { prisma } from "@/database";
import { computeGithubStats } from "@/features/skill-gap-analysis/services/github-analysis-service";
import {
	isValidGithubUsername,
	syncUserGithubRepos,
} from "@/features/skill-gap-analysis/services/github-service";
import type {
	DashboardData,
	GithubAnalysisResponse,
	SyncGithubResponse,
} from "../types/user.types";

export async function getUserProfile(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { repositories: true },
	});

	return user;
}

export async function updateCareerGoal(userId: string, careerGoal: string) {
	const user = await prisma.user.update({
		where: { id: userId },
		data: { careerGoal },
	});
	return { careerGoal: user.careerGoal };
}

export async function saveResumeData(
	userId: string,
	resumeData: Record<string, unknown>,
	careerGoal?: string,
) {
	const skills = (resumeData?.skills as string[]) || [];

	const user = await prisma.user.update({
		where: { id: userId },
		data: {
			resumeData: resumeData as any,
			skills,
			...(careerGoal ? { careerGoal } : {}),
		},
	});
	return { resumeData: user.resumeData, careerGoal: user.careerGoal };
}

export async function getDashboard(userId: string): Promise<DashboardData> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { repositories: true },
	});
	if (!user) throw new Error("User not found");

	const repos = user.repositories || [];
	const skillGap = await prisma.skillGap.findFirst({
		where: { userId },
		orderBy: { updatedAt: "desc" },
	});
	const latestAssessment = await prisma.assessment.findFirst({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});

	const resumeData =
		(user.resumeData as Record<string, unknown> | null) || null;
	const resolvedCareerGoal =
		user.careerGoal || skillGap?.goal || "Full-Stack Developer";
	const github = computeGithubStats(repos, resolvedCareerGoal);
	const resumeScore =
		(resumeData?.resumeScore as number | undefined) ??
		(resumeData?.careerFit as { score?: number } | undefined)?.score ??
		null;
	const careerFitScore =
		(resumeData?.careerFit as { score?: number } | undefined)?.score ?? null;
	const matchScore = skillGap?.matchScore ?? null;
	const assessmentScore = latestAssessment?.score ?? null;

	const interviewReady = Math.round(
		[matchScore, assessmentScore, resumeScore, github.score]
			.filter((v) => typeof v === "number")
			.reduce((sum, v, _, arr) => sum + (v as number) / arr.length, 0) || 0,
	);

	const roadmap =
		(skillGap?.roadmap as {
			step: string;
			details: string;
			duration: string;
		}[]) || [];
	const currentMission = roadmap[0] || null;

	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			fullName: user.fullName,
			avatarUrl: user.avatarUrl,
			careerGoal:
				resumeData || skillGap
					? user.careerGoal || skillGap?.goal || null
					: null,
			skills: user.skills || [],
		},
		resume: {
			hasResume: !!resumeData,
			score: resumeScore,
			careerFitScore,
			skillCount: ((resumeData?.skills as string[]) || user.skills || [])
				.length,
			summary: (resumeData?.summary as string) || null,
			strengths: (resumeData?.strengths as string[]) || [],
		},
		skillGap: skillGap
			? {
					goal: skillGap.goal,
					matchScore: skillGap.matchScore,
					strong: skillGap.strong,
					improving: skillGap.improving,
					weak: skillGap.weak,
					coach: skillGap.coach,
					roadmap: skillGap.roadmap as {
						step: string;
						details: string;
						duration: string;
					}[],
				}
			: null,
		assessment: {
			latestScore: assessmentScore,
			hasTaken: assessmentScore !== null,
		},
		github: {
			totalRepositories: github.totalRepositories,
			totalStars: github.totalStars,
			topLanguage: github.mostUsedLanguage,
			score: github.score,
		},
		stats: {
			resumeScore: resumeScore ?? 0,
			githubScore: github.score,
			matchScore: matchScore ?? 0,
			interviewReady: interviewReady || 0,
		},
		currentMission,
		roadmapPreview: roadmap.slice(0, 5),
	};
}

export async function syncGithub(
	userId: string,
	githubUsername: string,
): Promise<SyncGithubResponse> {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) throw new Error("User not found");

	if (!isValidGithubUsername(githubUsername)) {
		throw new Error("Enter a valid GitHub username");
	}

	const updatedUser = await syncUserGithubRepos(user, githubUsername);
	const repos = updatedUser?.repositories || [];

	return {
		user: updatedUser,
		githubUsername: updatedUser?.githubUsername || githubUsername,
		repositoriesSynced: repos.length,
	};
}

export async function analyzeGithub(
	userId: string,
): Promise<GithubAnalysisResponse> {
	const user = await prisma.user.findUnique({ where: { id: userId } });
	const careerGoal = user?.careerGoal || "Full-Stack Developer";
	const repos = await prisma.repository.findMany({ where: { userId } });

	const githubStats = computeGithubStats(repos, careerGoal);

	return {
		languages: githubStats.languages,
		stats: {
			totalRepositories: githubStats.totalRepositories,
			totalStars: githubStats.totalStars,
			mostUsedLanguage: githubStats.mostUsedLanguage,
		},
		analysis: {
			score: githubStats.score,
			missingSkills: githubStats.missingSkills,
			matchedSkills: githubStats.matchedSkills,
			careerGoal: githubStats.careerGoal,
			recommendations: githubStats.recommendations,
		},
	};
}

export async function updateLearningPreferences(
	userId: string,
	preferences: Record<string, unknown>,
): Promise<Record<string, unknown>> {
	const user = await prisma.user.update({
		where: { id: userId },
		data: { learningPreferences: preferences as any },
	});
	return (user.learningPreferences as Record<string, unknown>) || {};
}
