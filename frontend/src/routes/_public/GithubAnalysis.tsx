import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DashboardNavbar from "@/components/DashboardNavbar";

interface GithubAnalysisProps {
  onBack: () => void;
  onResume: () => void;
  onSkillGapDashboard: () => void;
}

export default function GithubAnalysis({
  onBack,
  onResume,
  onSkillGapDashboard,
}: GithubAnalysisProps) {
  const [profile, setProfile] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Please sign in with GitHub first.");
      setLoading(false);
      return;
    }

    // Fetch user profile and repositories
    fetch("http://localhost:5000/api/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load GitHub profile.");
        return res.json();
      })
      .then((profileData) => {
        setProfile(profileData);
        // Trigger repository analysis
        return fetch("http://localhost:5000/api/github/analyze", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to analyze repositories.");
        return res.json();
      })
      .then((analysisData) => {
        setAnalysis(analysisData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "An error occurred while loading data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex flex-col justify-center items-center">
        <div className="animate-spin text-5xl mb-4">🐙</div>
        <p className="text-gray-500 font-bold text-lg">Fetching and analyzing your GitHub Repositories...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex flex-col justify-center items-center px-6">
        <div className="bg-white rounded-[32px] p-8 shadow-xl text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-[#171C4A] mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">{error || "Please authenticate first."}</p>
          <button
            onClick={onBack}
            className="bg-[#171C4A] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0f1438] transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6E8]">
      <DashboardNavbar
        onBack={onBack}
        onSkillGapDashboard={onSkillGapDashboard}
        onResumeDetails={onResume}
      />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatarUrl || "https://cdn-icons-png.flaticon.com/512/25/25231.png"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-4 border-[#171C4A]"
            />
            <div>
              <h1 className="text-4xl font-black text-[#171C4A]">
                {profile.fullName || profile.username}
              </h1>
              <p className="text-gray-500 mt-1">
                GitHub: <a href={`https://github.com/${profile.username}`} target="_blank" rel="noreferrer" className="underline hover:text-[#171C4A]">@{profile.username}</a>
              </p>
            </div>
          </div>

          <div className="bg-[#171C4A] text-white px-6 py-4 rounded-3xl font-bold flex items-center gap-2">
            🐙 Profile Synced
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-[32px] p-8 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase">Total Repositories</h3>
              <p className="text-4xl font-black text-[#171C4A] mt-2">
                {analysis?.stats.totalRepositories || 0}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase">Total Stars</h3>
              <p className="text-4xl font-black text-[#171C4A] mt-2">
                {analysis?.stats.totalStars || 0}
              </p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>

          <div className="bg-white rounded-[32px] p-8 shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase">Top Language</h3>
              <p className="text-4xl font-black text-[#171C4A] mt-2">
                {analysis?.stats.mostUsedLanguage || "N/A"}
              </p>
            </div>
            <div className="text-4xl">💻</div>
          </div>
        </div>

        {/* Middle row: Languages & AI Analysis */}
        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          {/* Languages card */}
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-[#171C4A] mb-6">💻 Language Breakdown</h2>
            <div className="space-y-4">
              {analysis?.languages && analysis.languages.length > 0 ? (
                analysis.languages.map((lang: any) => (
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

          {/* AI career coach & skill gaps */}
          <div className="bg-[#F2DD85] rounded-[32px] p-8 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#171C4A] mb-4">🤖 AI Repository Insights</h2>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl font-black text-[#171C4A]">{analysis?.analysis.score || 0}%</span>
                <span className="text-sm text-[#171C4A]/80 font-semibold uppercase tracking-wider">GitHub Readiness Score</span>
              </div>
              <p className="text-[#171C4A] leading-relaxed mb-6 font-medium">
                {analysis?.analysis.recommendations || "No recommendations generated yet."}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-[#171C4A] mb-2">Missing Market-Ready Skills:</h3>
              <div className="flex flex-wrap gap-2">
                {analysis?.analysis.missingSkills && analysis.analysis.missingSkills.length > 0 ? (
                  analysis.analysis.missingSkills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-white/80 text-[#171C4A] font-bold px-4 py-2 rounded-xl text-sm shadow-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="bg-white/80 text-[#171C4A] font-bold px-4 py-2 rounded-xl text-sm shadow-sm">
                    All set! You meet the market requirements.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Repositories List */}
        <div className="mt-10 bg-white rounded-[32px] p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-[#171C4A] mb-6">📂 Synced Repositories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.repositories && profile.repositories.length > 0 ? (
              profile.repositories.map((repo: any) => (
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
