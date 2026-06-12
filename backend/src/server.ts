import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req: any, res: Response, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Route: GitHub OAuth code exchange
app.post("/api/auth/github", async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is required" });
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: "Failed to retrieve access token from GitHub" });
    }

    // 2. Fetch user profile from GitHub
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubUser = userResponse.data;

    // 3. Fetch user emails to ensure we get their primary email
    let email = githubUser.email;
    if (!email) {
      const emailResponse = await axios.get("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const primaryEmailObj = emailResponse.data.find(
        (e: any) => e.primary && e.verified
      ) || emailResponse.data[0];
      email = primaryEmailObj?.email || `${githubUser.login}@github.com`;
    }

    // 4. Fetch user's public repositories
    const reposResponse = await axios.get("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const githubRepos = reposResponse.data;

    // 5. Upsert User in PostgreSQL database via Prisma
    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id },
      update: {
        email,
        username: githubUser.login,
        fullName: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
      },
      create: {
        githubId: githubUser.id,
        email,
        username: githubUser.login,
        fullName: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
      },
    });

    // 6. Sync repositories in database
    // Delete old repos that are no longer present or we want to overwrite
    await prisma.repository.deleteMany({
      where: { userId: user.id },
    });

    // Bulk insert current repos
    if (githubRepos && Array.isArray(githubRepos)) {
      const reposToCreate = githubRepos.map((repo: any) => ({
        userId: user.id,
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description || "",
        htmlUrl: repo.html_url,
        language: repo.language || "Unknown",
        starsCount: repo.stargazers_count || 0,
        forksCount: repo.forks_count || 0,
        updatedAt: new Date(repo.updated_at),
      }));

      await prisma.repository.createMany({
        data: reposToCreate,
      });
    }

    // 7. Generate JWT session token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error("Authentication error:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

// Route: Get current user profile and repositories
app.get("/api/user/profile", authenticateToken, async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { repositories: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (error: any) {
    console.error("Profile retrieval error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// Route: GitHub Repository analysis & Skill Gap mapping
app.post("/api/github/analyze", authenticateToken, async (req: any, res: Response) => {
  try {
    const repos = await prisma.repository.findMany({
      where: { userId: req.user.id },
    });

    // Compute language statistics
    const languageCounts: { [key: string]: number } = {};
    let totalRepos = repos.length;

    repos.forEach((repo) => {
      const lang = repo.language || "Unknown";
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    });

    // Calculate percentage breakdown
    const languages = Object.entries(languageCounts).map(([name, count]) => ({
      name,
      count,
      percentage: totalRepos > 0 ? Math.round((count / totalRepos) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Compute some mock analysis highlights based on repo counts and languages
    const totalStars = repos.reduce((acc, repo) => acc + repo.starsCount, 0);
    const mostUsedLanguage = languages[0]?.name || "None";

    // Standard market full stack skills to compare against (simple rule-based AI Career Coach recommendation)
    const marketSkills = ["React", "Node.js", "SQL", "Docker", "AWS"];
    const foundSkills = languages.map(l => l.name.toLowerCase());
    
    // Identify gaps
    const missingSkills = marketSkills.filter(skill => {
      // Basic check
      if (skill === "SQL") {
        return !foundSkills.includes("sql") && !foundSkills.includes("postgresql") && !foundSkills.includes("mysql");
      }
      return !foundSkills.includes(skill.toLowerCase());
    });

    const score = Math.max(30, 100 - (missingSkills.length * 12));

    return res.json({
      languages,
      stats: {
        totalRepositories: totalRepos,
        totalStars,
        mostUsedLanguage,
      },
      analysis: {
        score,
        missingSkills,
        recommendations: `Focus on learning ${missingSkills.join(" and ")} to boost your Full Stack employability score.`,
      }
    });
  } catch (error: any) {
    console.error("Repository analysis error:", error.message);
    return res.status(500).json({ error: "Failed to analyze repositories" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
