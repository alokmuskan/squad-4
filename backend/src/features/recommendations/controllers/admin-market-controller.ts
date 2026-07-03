import type { Response } from "express";
import type { AuthRequest } from "@/middleware/authenticate";
import { CAREER_GOALS } from "@/features/skill-gap-analysis/services/career-goals-service";
import { generateJobPostingsForGoal } from "@/services/job-market/job-posting-generator";
import {
	aggregatePostingsIntoProfile,
	saveJobPostings,
	saveMarketProfile,
	storePostingsAsVectors,
} from "@/services/job-market/market-profile-service";

export async function refreshMarketProfilesController(
	req: AuthRequest,
	res: Response,
): Promise<void> {
	const { goal } = req.query;

	const goalsToRefresh = goal
		? [String(goal)]
		: [...CAREER_GOALS];

	const results: { goal: string; status: string; postingsCount: number; error?: string }[] = [];

	for (const g of goalsToRefresh) {
		try {
			console.log(`[MarketProfile] Generating postings for: ${g}`);
			const postings = await generateJobPostingsForGoal(g, 30);

			if (postings.length === 0) {
				results.push({ goal: g, status: "skipped", postingsCount: 0, error: "AI unavailable" });
				continue;
			}

			const profile = aggregatePostingsIntoProfile(g, postings);
			await saveMarketProfile(profile);

			await saveJobPostings(g, postings);
			await storePostingsAsVectors(g, postings);

			results.push({
				goal: g,
				status: "success",
				postingsCount: postings.length,
			});

			console.log(`[MarketProfile] ✅ ${g}: ${postings.length} postings saved`);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			console.error(`[MarketProfile] ❌ ${g}: ${message}`);
			results.push({ goal: g, status: "error", postingsCount: 0, error: message });
		}
	}

	res.json({
		message: goal
			? `Market profile refreshed for: ${goal}`
			: `Market profiles refreshed for ${results.length} goals`,
		results,
	});
}
