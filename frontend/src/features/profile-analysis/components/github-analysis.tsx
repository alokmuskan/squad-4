import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useGithubAnalysis, useSyncGithub, useUserProfile } from "@/hooks/use-queries";
import { useAuth } from "@/features/authentication/hooks/use-auth";
import DashboardNavbar from "@/features/dashboard/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { githubUsernameSchema, type GithubUsernameForm } from "@/features/authentication/schemas/login-schema";

interface GithubProfile {
  githubUsername?: string;
  githubId?: string;
  username: string;
  fullName?: string;
  githubAvatarUrl?: string;
  githubBio?: string;
  githubLocation?: string;
  githubFollowers?: number;
  githubFollowing?: number;
  githubPublicRepos?: number;
  careerGoal?: string;
  repositories?: Array<{
    id: string;
    htmlUrl: string;
    name: string;
    language?: string;
    description?: string;
    starsCount: number;
    forksCount: number;
  }>;
}

interface GithubAnalysisData {
  stats: { totalStars: number };
  analysis: {
    score: number;
    recommendations: string;
    careerGoal: string;
    matchedSkills: string[];
    missingSkills: string[];
  };
  languages: Array<{ name: string; percentage: number }>;
}

export default function GithubAnalysis() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [avatarError, setAvatarError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<GithubUsernameForm>({
    resolver: zodResolver(githubUsernameSchema),
  });

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile();

  const profileData = profile as GithubProfile | undefined;
  const hasGithubLinked = !!(profileData?.githubUsername || profileData?.githubId);

  const {
    data: analysis,
    isLoading: analysisLoading,
    error: analysisError,
  } = useGithubAnalysis(hasGithubLinked);

  const analysisData = analysis as GithubAnalysisData | undefined;

  const syncGithub = useSyncGithub();

  const loading = profileLoading || (hasGithubLinked && analysisLoading);
  const formError = errors.githubUsername?.message || "";
  const error =
    formError ||
    (profileError instanceof Error ? profileError.message : "") ||
    (hasGithubLinked ? (analysisError instanceof Error ? analysisError.message : "") : "") ||
    "";

  const githubHandle = profileData?.githubUsername || (profileData?.githubId ? profileData?.username : null);

  const handleGithubSync = async (data: GithubUsernameForm) => {
    try {
      await syncGithub.mutateAsync(data.githubUsername);
      await refreshUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to link GitHub username.";
      setError("githubUsername", { message });
    }
  };

  const handleResync = async () => {
    if (!githubHandle) {
      setError("githubUsername", { message: "No GitHub username found to resync." });
      return;
    }

    try {
      await syncGithub.mutateAsync(githubHandle);
      await refreshUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resync GitHub data.";
      setError("githubUsername", { message });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex flex-col justify-center items-center">
        <div className="animate-spin text-5xl mb-4">🐙</div>
        <p className="text-gray-500 font-bold text-lg">Fetching and analyzing your GitHub Repositories...</p>
      </div>
    );
  }

  if (!hasGithubLinked) {
    return (
      <div className="min-h-screen bg-[#F8F6E8]">
        <DashboardNavbar />
        <div className="max-w-xl mx-auto px-6 py-16">
          <Card className="rounded-[32px] shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="text-5xl mb-2">🐙</div>
              <CardTitle className="text-3xl font-black text-[#171C4A]">Link Your GitHub</CardTitle>
              <CardDescription className="text-base mt-2">
                You signed in with Google. Enter your public GitHub username so we can analyze your
                repositories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(handleGithubSync)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#171C4A] mb-2">
                    GitHub Username
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium text-sm">github.com/</span>
                    <Input
                      {...register("githubUsername")}
                      placeholder="your-username"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  {errors.githubUsername && (
                    <p className="mt-1 text-sm text-red-600">{errors.githubUsername.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={syncGithub.isPending}
                  className="w-full py-6 rounded-2xl bg-[#171C4A] text-white font-bold"
                >
                  {syncGithub.isPending ? "Syncing repositories..." : "Analyze My GitHub →"}
                </Button>
              </form>

              <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="w-full mt-4 py-3 text-gray-500 font-medium"
              >
                Back to Dashboard
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex flex-col justify-center items-center px-6">
        <div className="bg-white rounded-[32px] p-8 shadow-xl text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-[#171C4A] mb-2">Could Not Load GitHub Data</h3>
          <p className="text-gray-500 mb-6">{error || "Please try again."}</p>
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="bg-[#171C4A] text-white px-8 py-3 rounded-full font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6E8]">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                avatarError || !profileData?.githubAvatarUrl
                  ? "https://cdn-icons-png.flaticon.com/512/25/25231.png"
                  : profileData.githubAvatarUrl
              }
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-[#171C4A]"
              onError={() => setAvatarError(true)}
            />
            <div>
              <h1 className="text-4xl font-black text-[#171C4A]">
                {profileData?.fullName || githubHandle}
              </h1>
              {githubHandle && (
                <p className="text-gray-500 mt-1">
                  GitHub:{" "}
                  <a
                    href={`https://github.com/${githubHandle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-[#171C4A]"
                  >
                    @{githubHandle}
                  </a>
                </p>
              )}
              {profileData?.githubBio && (
                <p className="text-gray-600 mt-2 text-sm max-w-md">{profileData.githubBio}</p>
              )}
              {profileData?.githubLocation && (
                <p className="text-gray-500 mt-1 text-sm">📍 {profileData.githubLocation}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#171C4A] text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 text-sm">
              🐙 Profile Synced
            </div>
            <Button
              onClick={handleResync}
              disabled={syncGithub.isPending}
              className="bg-[#171C4A] text-white hover:bg-[#2a3a6a] font-bold px-5 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
            >
              {syncGithub.isPending ? (
                <>
                  <div className="animate-spin">🔄</div>
                  <span>Resyncing...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Resync</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-[32px] p-6 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-xs uppercase">Followers</h3>
              <p className="text-3xl font-black text-[#171C4A] mt-2">
                {profileData?.githubFollowers || 0}
              </p>
            </div>
            <div className="text-3xl">👥</div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-xs uppercase">Following</h3>
              <p className="text-3xl font-black text-[#171C4A] mt-2">
                {profileData?.githubFollowing || 0}
              </p>
            </div>
            <div className="text-3xl">�</div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-xs uppercase">Public Repos</h3>
              <p className="text-3xl font-black text-[#171C4A] mt-2">
                {profileData?.githubPublicRepos || 0}
              </p>
            </div>
            <div className="text-3xl">📦</div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-xs uppercase">Total Stars</h3>
              <p className="text-3xl font-black text-[#171C4A] mt-2">
                {analysisData?.stats.totalStars || 0}
              </p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-[#171C4A] mb-6">💻 Language Breakdown</h2>
            <div className="space-y-4">
              {analysisData?.languages && analysisData.languages.length > 0 ? (
                analysisData.languages.map((lang: { name: string; percentage: number }) => (
                  <div key={lang.name}>
                    <div className="flex justify-between text-sm font-bold mb-1 text-gray-700">
                      <span>{lang.name}</span>
                      <span>{lang.percentage}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lang.percentage}%` }}
                        transition={{ duration: 1 }}
                        className="h-full bg-[#171C4A] rounded-full"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No language data found.</p>
              )}
            </div>
          </div>

          <div className="bg-[#F2DD85] rounded-[32px] p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#171C4A] mb-4">🤖 AI Repository Insights</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-black text-[#171C4A]">
                  {analysisData?.analysis.score || 0}%
                </span>
                <span className="text-sm text-[#171C4A]/80 font-semibold uppercase tracking-wider">
                  GitHub Readiness Score
                </span>
              </div>
              <p className="text-[#171C4A] leading-relaxed mb-6 font-medium">
                {analysisData?.analysis.recommendations || "No recommendations generated yet."}
              </p>
            </div>

            {analysisData?.analysis.matchedSkills && analysisData.analysis.matchedSkills.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-[#171C4A] mb-2">Detected in Your Repos:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisData.analysis.matchedSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-xl text-sm shadow-sm"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-[#171C4A] mb-2">
                Gaps for {analysisData?.analysis.careerGoal || "your career goal"}:
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisData?.analysis.missingSkills && analysisData.analysis.missingSkills.length > 0 ? (
                  analysisData.analysis.missingSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-white/80 text-[#171C4A] font-bold px-4 py-2 rounded-xl text-sm shadow-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="bg-white/80 text-[#171C4A] font-bold px-4 py-2 rounded-xl text-sm shadow-sm">
                    Strong alignment with your target role.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-white rounded-[32px] p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-[#171C4A] mb-6">📂 Synced Repositories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData?.repositories && profileData.repositories.length > 0 ? (
              profileData.repositories.map((repo: {
                id: string;
                htmlUrl: string;
                name: string;
                language?: string;
                description?: string;
                starsCount: number;
                forksCount: number;
              }) => (
                <div
                  key={repo.id}
                  className="bg-[#F8F6E8] p-6 rounded-3xl border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-[#171C4A] text-lg hover:underline"
                    >
                      {repo.name}
                    </a>
                    <span className="bg-white/90 text-xs font-bold px-3 py-1 rounded-full text-[#171C4A] border">
                      {repo.language || "Unknown"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px] mb-4">
                    {repo.description || "No description provided."}
                  </p>
                  <div className="flex gap-4 text-xs font-bold text-gray-500">
                    <span>⭐ {repo.starsCount} Stars</span>
                    <span>🍴 {repo.forksCount} Forks</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2 text-center py-6">No repositories found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
