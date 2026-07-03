export interface RepoInfo {
	name: string;
	description: string | null;
	language: string | null;
	starsCount: number;
	forksCount: number;
}

export function computeGithubStats(repos: RepoInfo[]) {
	const langCount: Record<string, number> = {};
	let totalStars = 0;
	let totalForks = 0;

	for (const repo of repos) {
		if (repo.language) {
			langCount[repo.language] = (langCount[repo.language] || 0) + 1;
		}
		totalStars += repo.starsCount;
		totalForks += repo.forksCount;
	}

	const topLanguages = Object.entries(langCount)
		.sort(([, a], [, b]) => b - a)
		.slice(0, 5)
		.map(([lang]) => lang);

	return {
		totalRepos: repos.length,
		totalStars,
		totalForks,
		topLanguages,
		languageBreakdown: langCount,
	};
}
