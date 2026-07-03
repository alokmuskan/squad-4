import type { Prisma } from "@prisma/client";
import { prisma } from "@/database";
import type { AgentState } from "@/features/ai-agents/types/agent.types";

export async function persistResultsNode(
	state: AgentState,
): Promise<Partial<AgentState>> {
	if (!state.skillGapResult) {
		return { status: "completed" };
	}

	try {
		const [snapshot] = await prisma.$transaction(async (tx) => {
			const snap = await tx.skillGapSnapshot.create({
				data: {
					userId: state.userId,
					goal: state.careerGoal,
					matchScore: state.skillGapResult?.matchScore ?? 0,
					data: state.skillGapResult as unknown as Prisma.InputJsonValue,
				},
			});

			if (state.resourceRecommendations.length > 0) {
				await tx.resourceRecommendation.deleteMany({
					where: { userId: state.userId },
				});

				await tx.resourceRecommendation.createMany({
					data: state.resourceRecommendations.map((r) => ({
						userId: state.userId,
						goal: state.careerGoal,
						skill: r.skill,
						title: r.title,
						url: r.url,
						platform: r.platform,
						type: r.type,
						difficulty: r.difficulty,
						duration: r.duration,
						reason: r.reason,
						source: "curated",
					})),
				});
			}

			return [snap];
		});

		return {
			status: "completed",
			snapshotId: snapshot.id,
		};
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		console.error("Persist agent failed:", message);
		return { status: "error", error: message };
	}
}
