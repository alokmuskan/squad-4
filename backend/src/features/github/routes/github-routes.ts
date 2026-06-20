import { Router } from "express";
import { prisma } from "../../../database/prisma.js";
import {
  authenticate,
  type AuthenticatedRequest,
} from "../../../middleware/auth-middleware.js";


type GitHubRepoResponse = {
  language: string | null;
  stargazers_count: number;
};


const marketSkills = [
  "TypeScript",
  "Testing",
  "CI/CD",
  "Docker",
  "PostgreSQL",
  "Cloud Deployment",
];

export const githubRouter = Router();

githubRouter.post("/analyze", authenticate, async (req, res, next) => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user?.githubToken) {
      return res.status(404).json({
        error: "GitHub profile not found for this user.",
      });
    }

    const reposResponse = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${user.githubToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!reposResponse.ok) {
      return res.status(400).json({
        error: "Failed to fetch GitHub repositories.",
      });
    }

    const repos = (await reposResponse.json()) as GitHubRepoResponse[];
    const languageCounts = new Map<string, number>();
    let totalStars = 0;

    for (const repo of repos) {
      totalStars += repo.stargazers_count;

      if (repo.language) {
        languageCounts.set(repo.language, (languageCounts.get(repo.language) || 0) + 1);
      }
    }

    const totalLanguageRepos = [...languageCounts.values()].reduce(
      (sum, count) => sum + count,
      0
    );
    const languages = [...languageCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        percentage: totalLanguageRepos
          ? Math.round((count / totalLanguageRepos) * 100)
          : 0,
      }));

    const detectedSkills = new Set(languages.map((language) => language.name));
    const missingSkills = marketSkills.filter((skill) => !detectedSkills.has(skill));
    const score = Math.max(35, Math.min(95, 95 - missingSkills.length * 8));

    return res.json({
      stats: {
        totalRepositories: repos.length,
        totalStars,
        mostUsedLanguage: languages[0]?.name || "N/A",
      },
      languages,
      analysis: {
        score,
        missingSkills,
        recommendations:
          missingSkills.length > 0
            ? `Your repositories show activity in ${languages[0]?.name || "multiple areas"}. Add visible projects or README evidence for ${missingSkills.slice(0, 3).join(", ")} to strengthen your profile.`
            : "Your GitHub profile already shows a strong spread of market-ready skills.",
      },
    });
  } catch (error) {
    next(error);
  }
});
