import axios from "axios";
import { prisma } from "@/database";

export function isValidGithubUsername(username: string): boolean {
	return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}

async function fetchPublicGithubData(username: string) {
	const normalized = username.trim();
	const headers = {
		Accept: "application/vnd.github+json",
		"User-Agent": "LearnFlow-App",
	};

	const profileResponse = await axios.get(
		`https://api.github.com/users/${normalized}`,
		{
			headers,
		},
	);
	const reposResponse = await axios.get(
		`https://api.github.com/users/${normalized}/repos?per_page=100&sort=updated`,
		{ headers },
	);

	return {
		profile: profileResponse.data,
		repos: reposResponse.data as Record<string, unknown>[],
	};
}

function mapGithubRepoRecords(
	repos: Record<string, unknown>[],
	userId: string,
) {
	return repos.map((repo) => ({
		userId,
		githubId: repo.id as number,
		name: repo.name as string,
		fullName: repo.full_name as string,
		description: (repo.description as string) || "",
		htmlUrl: repo.html_url as string,
		language: (repo.language as string) || "Unknown",
		starsCount: (repo.stargazers_count as number) || 0,
		forksCount: (repo.forks_count as number) || 0,
		updatedAt: new Date(repo.updated_at as string),
	}));
}

export async function syncUserGithubRepos(
	user: {
		id: string;
		avatarUrl: string | null;
		fullName: string | null;
	},
	githubUsername: string,
) {
	const { profile, repos } = await fetchPublicGithubData(githubUsername);
	const login = profile.login as string;

	await prisma.user.update({
		where: { id: user.id },
		data: {
			githubUsername: login,
			githubAvatarUrl: profile.avatar_url as string,
			fullName: user.fullName || (profile.name as string) || user.fullName,
			githubBio: (profile.bio as string) || null,
			githubLocation: (profile.location as string) || null,
			githubFollowers: (profile.followers as number) || null,
			githubFollowing: (profile.following as number) || null,
			githubPublicRepos: (profile.public_repos as number) || null,
		},
	});

	await prisma.repository.deleteMany({ where: { userId: user.id } });
	if (repos.length > 0) {
		for (const repo of mapGithubRepoRecords(repos, user.id)) {
			await prisma.repository.upsert({
				where: {
					userId_githubId: {
						userId: repo.userId,
						githubId: repo.githubId,
					},
				},
				update: repo,
				create: repo,
			});
		}
	}

	return prisma.user.findUnique({
		where: { id: user.id },
		include: { repositories: true },
	});
}
