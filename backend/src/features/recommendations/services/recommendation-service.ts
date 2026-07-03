import { prisma } from "@/database";
import type { ResourceRecommendationResponse } from "../types/recommendation.types";

export async function getResourceRecommendations(
	userId: string,
	goal?: string,
): Promise<{
	recommendations: ResourceRecommendationResponse[];
	groupedBySkill: Record<string, ResourceRecommendationResponse[]>;
	total: number;
	completedCount: number;
}> {
	const where: Record<string, unknown> = { userId };
	if (goal) where.goal = goal;

	const resources = await prisma.resourceRecommendation.findMany({
		where: where as any,
		orderBy: { createdAt: "desc" },
		include: {
			feedback: {
				where: { userId },
				select: { rating: true, bookmarked: true, completedAt: true },
			},
		},
	});

	const mapped: ResourceRecommendationResponse[] = resources.map((r) => ({
		id: r.id,
		skill: r.skill,
		title: r.title,
		url: r.url,
		platform: r.platform,
		type: r.type,
		difficulty: r.difficulty,
		duration: r.duration,
		reason: r.reason,
		completed: r.completed,
		source: r.source,
		rating: r.feedback[0]?.rating ?? null,
		voteCount: r.voteCount,
		bookmarked: r.feedback[0]?.bookmarked ?? false,
		createdAt: r.createdAt.toISOString(),
	}));

	const groupedBySkill: Record<string, ResourceRecommendationResponse[]> = {};
	for (const r of mapped) {
		if (!groupedBySkill[r.skill]) groupedBySkill[r.skill] = [];
		groupedBySkill[r.skill].push(r);
	}

	return {
		recommendations: mapped,
		groupedBySkill,
		total: mapped.length,
		completedCount: mapped.filter((r) => r.completed).length,
	};
}

export async function markResourceComplete(
	id: string,
	userId: string,
	completed: boolean,
): Promise<ResourceRecommendationResponse> {
	const resource = await prisma.resourceRecommendation.updateMany({
		where: { id, userId },
		data: { completed },
	});

	if (resource.count === 0) {
		throw new Error("Resource not found or not owned by user");
	}

	const updated = await prisma.resourceRecommendation.findUniqueOrThrow({
		where: { id },
		include: {
			feedback: {
				where: { userId },
				select: { rating: true, bookmarked: true, completedAt: true },
			},
		},
	});

	await prisma.userResourceFeedback.upsert({
		where: { userId_resourceId: { userId, resourceId: id } },
		create: {
			userId,
			resourceId: id,
			completedAt: completed ? new Date() : null,
		},
		update: { completedAt: completed ? new Date() : null },
	});

	return {
		id: updated.id,
		skill: updated.skill,
		title: updated.title,
		url: updated.url,
		platform: updated.platform,
		type: updated.type,
		difficulty: updated.difficulty,
		duration: updated.duration,
		reason: updated.reason,
		completed: updated.completed,
		source: updated.source,
		rating: updated.feedback[0]?.rating ?? null,
		voteCount: updated.voteCount,
		bookmarked: updated.feedback[0]?.bookmarked ?? false,
		createdAt: updated.createdAt.toISOString(),
	};
}

export async function getLatestSnapshot(userId: string): Promise<{
	snapshotId: string;
	matchScore: number;
	goal: string;
	createdAt: string;
} | null> {
	const snapshot = await prisma.skillGapSnapshot.findFirst({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});

	if (!snapshot) return null;

	return {
		snapshotId: snapshot.id,
		matchScore: snapshot.matchScore,
		goal: snapshot.goal,
		createdAt: snapshot.createdAt.toISOString(),
	};
}

export async function rateResource(
	id: string,
	userId: string,
	rating: number,
): Promise<void> {
	const resource = await prisma.resourceRecommendation.findUnique({
		where: { id },
	});

	if (!resource) {
		throw new Error("Resource not found");
	}

	const existingFeedback = await prisma.userResourceFeedback.findUnique({
		where: { userId_resourceId: { userId, resourceId: id } },
	});

	if (existingFeedback?.rating) {
		await prisma.resourceRecommendation.update({
			where: { id },
			data: { voteCount: { decrement: 1 } },
		});
	}

	await prisma.userResourceFeedback.upsert({
		where: { userId_resourceId: { userId, resourceId: id } },
		create: { userId, resourceId: id, rating },
		update: { rating },
	});

	const allRatings = await prisma.userResourceFeedback.findMany({
		where: { resourceId: id, rating: { not: null } },
		select: { rating: true },
	});

	const avgRating =
		allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length;

	await prisma.resourceRecommendation.update({
		where: { id },
		data: {
			rating: avgRating,
			voteCount: allRatings.length,
		},
	});
}

export async function toggleBookmark(
	id: string,
	userId: string,
	bookmarked: boolean,
): Promise<void> {
	await prisma.userResourceFeedback.upsert({
		where: { userId_resourceId: { userId, resourceId: id } },
		create: { userId, resourceId: id, bookmarked },
		update: { bookmarked },
	});
}

export async function getUserFeedbackHistory(
	userId: string,
): Promise<{ rated: number; bookmarked: number; completed: number }> {
	const [rated, bookmarked, completed] = await Promise.all([
		prisma.userResourceFeedback.count({
			where: { userId, rating: { not: null } },
		}),
		prisma.userResourceFeedback.count({
			where: { userId, bookmarked: true },
		}),
		prisma.resourceRecommendation.count({
			where: { userId, completed: true },
		}),
	]);

	return { rated, bookmarked, completed };
}

export async function getResourceAnalytics(skill?: string): Promise<{
	topRated: {
		id: string;
		title: string;
		skill: string;
		rating: number;
		voteCount: number;
	}[];
	mostCompleted: {
		id: string;
		title: string;
		skill: string;
		completionCount: number;
	}[];
	totalResources: number;
	totalCompletions: number;
}> {
	const where: Record<string, unknown> = {};
	if (skill) where.skill = { contains: skill, mode: "insensitive" };

	const resources = await prisma.resourceRecommendation.findMany({
		where: where as any,
		include: {
			_count: { select: { feedback: true } },
		},
	});

	const topRated = resources
		.filter((r) => r.voteCount > 0)
		.sort((a, b) => b.rating - a.rating)
		.slice(0, 10)
		.map((r) => ({
			id: r.id,
			title: r.title,
			skill: r.skill,
			rating: r.rating,
			voteCount: r.voteCount,
		}));

	const completionCounts = await prisma.userResourceFeedback.groupBy({
		by: ["resourceId"],
		where: { completedAt: { not: null } },
		_count: { resourceId: true },
	});

	const resourceCompletionMap = new Map(
		completionCounts.map((c) => [c.resourceId, c._count.resourceId]),
	);
	const mostCompleted = resources
		.map((r) => ({
			id: r.id,
			title: r.title,
			skill: r.skill,
			completionCount: resourceCompletionMap.get(r.id) || 0,
		}))
		.sort((a, b) => b.completionCount - a.completionCount)
		.slice(0, 10);

	const totalCompletions = completionCounts.reduce(
		(sum, c) => sum + c._count.resourceId,
		0,
	);

	return {
		topRated,
		mostCompleted,
		totalResources: resources.length,
		totalCompletions,
	};
}
