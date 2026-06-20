import { Router } from "express";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth-middleware.js";
import { prisma } from "../database/prisma.js";

type GitHubRepoResponse = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
};

export const userRouter = Router();

userRouter.get("/profile", authenticate, async (req, res, next) => {
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
      "https://api.github.com/user/repos?sort=updated&per_page=30",
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

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      avatarUrl: user.avatarUrl,
      repositories: repos.map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        language: repo.language,
        starsCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        updatedAt: repo.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});
