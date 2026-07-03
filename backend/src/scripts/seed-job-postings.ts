import { CAREER_GOALS } from "@/features/skill-gap-analysis/services/career-goals-service";
import { generateJobPostingsForGoal } from "@/services/job-market/job-posting-generator";
import {
	aggregatePostingsIntoProfile,
	saveJobPostings,
	saveMarketProfile,
	storePostingsAsVectors,
} from "@/services/job-market/market-profile-service";

const specificGoal = process.argv[2];

async function seedGoal(goal: string): Promise<void> {
	console.log(`[${goal}] Generating 30 job postings...`);
	const start = Date.now();

	const postings = await generateJobPostingsForGoal(goal, 30);

	if (postings.length === 0) {
		console.log(`[${goal}] ⚠️  No postings generated (AI unavailable)`);
		return;
	}

	console.log(`[${goal}] ✅ Generated ${postings.length} postings in ${(Date.now() - start) / 1000}s`);

	const profile = aggregatePostingsIntoProfile(goal, postings);
	await saveMarketProfile(profile);

	console.log(`[${goal}] 📊 Market profile saved:`);
	console.log(`       Skills: ${profile.weightedSkills.length}`);
	console.log(`       Top Companies: ${profile.topCompanies.slice(0, 4).join(", ")}`);

	await saveJobPostings(goal, postings);
	console.log(`[${goal}] 💾 ${postings.length} raw job postings saved to DB`);

	await storePostingsAsVectors(goal, postings);
	console.log(`[${goal}] 🧠 Vector embeddings stored\n`);
}

async function main(): Promise<void> {
	if (specificGoal) {
		console.log(`=== Seeding single goal: ${specificGoal} ===\n`);
		await seedGoal(specificGoal);
	} else {
		console.log("=== Starting job posting seed for all career goals ===\n");
		for (const goal of CAREER_GOALS) {
			await seedGoal(goal);
		}
	}
	console.log("=== Seed complete! ===");
}

main()
	.then(() => {
		console.log("Done.");
		process.exit(0);
	})
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	});
