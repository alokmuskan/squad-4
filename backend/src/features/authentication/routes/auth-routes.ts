import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { createAuthToken } from "../providers/auth.js";
import { prisma } from "../database/prisma.js";

const githubAuthSchema = z.object({
  code: z.string().min(1),
  redirect_uri: z.string().url(),
});


type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GitHubUserResponse = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type GitHubEmailResponse = {
  email: string;
  primary: boolean;
  verified: boolean;
};

export const authRouter = Router();

authRouter.post("/github", async (req, res, next) => {
  try {
    const parsed = githubAuthSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid GitHub auth request.",
      });
    }

    const { code, redirect_uri } = parsed.data;

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri,
      }),
    });

    const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(400).json({
        error:
          tokenData.error_description ||
          tokenData.error ||
          "Failed to exchange GitHub authorization code.",
      });
    }

    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!githubUserResponse.ok) {
      return res.status(400).json({
        error: "Failed to fetch GitHub user profile.",
      });
    }

    const githubUser = (await githubUserResponse.json()) as GitHubUserResponse;
    let email = githubUser.email;

    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as GitHubEmailResponse[];
        email =
          emails.find((item) => item.primary && item.verified)?.email ||
          emails.find((item) => item.verified)?.email ||
          null;
      }
    }

    const userEmail = email || `${githubUser.login}@users.noreply.github.com`;
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { githubId: githubUser.id },
          { email: userEmail },
          { username: githubUser.login },
        ],
      },
    });

    const userData = {
      githubId: githubUser.id,
      username: githubUser.login,
      githubToken: tokenData.access_token,
      email: userEmail,
      fullName: githubUser.name || githubUser.login,
      avatarUrl: githubUser.avatar_url,
    };

    const user = existingUser
      ? await prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: userData,
        })
      : await prisma.user.create({
          data: {
            id: `github_${githubUser.id}`,
            ...userData,
          },
        });

    const token = createAuthToken(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        avatarUrl: user.avatarUrl,
        githubUsername: user.username,
      },
    });
  } catch (error) {
    next(error);
  }
});
