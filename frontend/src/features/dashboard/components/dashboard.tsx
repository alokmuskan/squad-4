import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/authentication/hooks/use-auth";
import { useResourceRecommendations, useDashboard } from "@/hooks/use-queries";
import DashboardNavbar from "./dashboard-navbar";

interface DashboardData {
  user: {
    fullName?: string;
    username: string;
    careerGoal: string;
    skills: string[];
  };
  resume: {
    hasResume: boolean;
    score: number | null;
    skillCount: number;
  };
  skillGap: {
    goal: string;
    matchScore: number;
    coach: string;
    weak: string[];
    roadmap: { step: string; details: string; duration: string }[];
  } | null;
  assessment: { latestScore: number | null };
  github: { totalRepositories: number; totalStars: number; score: number };
  stats: {
    resumeScore: number;
    githubScore: number;
    matchScore: number;
    interviewReady: number;
  };
  currentMission: { step: string; details: string; duration: string } | null;
  roadmapPreview: { step: string; details: string; duration: string }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboard();
  const dashboardData = data as DashboardData | null;

  const { data: resources } = useResourceRecommendations(dashboardData?.user.careerGoal);
  const displayName = dashboardData?.user.fullName || user?.fullName || user?.username || "there";
  const careerGoal = dashboardData?.user.careerGoal || "your target role";
  const matchScore = dashboardData?.stats.matchScore ?? 0;
  const level = Math.max(1, Math.floor(matchScore / 15));
  const resourceCount = resources?.total ?? 0;
  const completedCount = resources?.completedCount ?? 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex items-center justify-center">
        <p className="text-gray-500 font-bold">Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex items-center justify-center px-6">
        <div className="bg-white rounded-[32px] p-10 shadow-xl text-center max-w-md">
          <p className="text-gray-500 mb-6">{error instanceof Error ? error.message : error || "Could not load dashboard."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#171C4A] text-white rounded-2xl font-bold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const topWeakSkills = dashboardData?.skillGap?.weak?.slice(0, 4) || [];

  return (
    <div className="min-h-screen bg-[#F8F6E8]">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-[#171C4A]">Welcome Back, {displayName} 👋</h1>
              <p className="text-gray-500 mt-2">
                {dashboardData?.resume.hasResume
                  ? `Working toward ${careerGoal}`
                  : `Upload your resume to start your ${careerGoal} journey`}
              </p>
          </div>

          <div className="bg-[#171C4A] text-white px-6 py-4 rounded-3xl">
            {dashboardData?.skillGap ? `${dashboardData.skillGap.matchScore}% Role Match` : "Get Started"}
          </div>
        </div>

        <div className="mt-8 bg-[#171C4A] rounded-[40px] p-10 text-white shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/70">Current Level</p>
              <h2 className="text-6xl font-black mt-2">Level {level}</h2>
              <p className="text-2xl mt-3">{careerGoal}</p>
            </div>
            <div className="text-8xl">🏆</div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between mb-2">
              <span>Progress to Goal</span>
              <span>{matchScore}%</span>
            </div>
            <div className="h-5 bg-white/20 rounded-full">
              <div
                className="h-5 bg-[#F2DD85] rounded-full transition-all"
                style={{ width: `${Math.min(100, matchScore)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <button
            onClick={() => navigate({ to: "/resources" })}
            className="bg-white rounded-[32px] p-8 shadow-xl text-left hover:scale-[1.02] transition"
          >
            <h2 className="text-2xl font-bold text-[#171C4A]">📚 Learning Resources</h2>
            {resourceCount > 0 ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-black">{resourceCount}</span>
                    <span className="ml-1 text-sm">total</span>
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl">
                    <span className="text-2xl font-black">{completedCount}</span>
                    <span className="ml-1 text-sm">done</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Click to view courses, videos, and projects for your skill gaps.</p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-gray-500">No resources yet. Generate personalized recommendations for your weak skills.</p>
                <span className="inline-block mt-4 px-6 py-3 bg-[#171C4A] text-white rounded-2xl font-bold text-sm">
                  Generate Resources →
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => navigate({ to: "/chatbot" })}
            className="bg-[#F2DD85] rounded-[32px] p-8 shadow-xl text-left hover:scale-[1.02] transition"
          >
            <h2 className="text-2xl font-bold text-[#171C4A]">🤖 AI Career Coach</h2>
            <p className="mt-5 text-[#171C4A]">
              {dashboardData.skillGap?.coach ||
                (dashboardData.resume.hasResume
                  ? "Run skill gap analysis to get personalized coaching based on your profile."
                  : "Upload your resume and run analysis to receive AI coaching tailored to your goals.")}
            </p>
            <span className="inline-block mt-4 px-6 py-2 bg-[#171C4A] text-white rounded-2xl font-bold text-sm">
              Chat Now →
            </span>
          </button>
        </div>

        {topWeakSkills.length > 0 && (
          <div className="mt-10 bg-white rounded-[32px] p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-[#171C4A]">🎯 Skills to Improve</h2>
            <div className="flex flex-wrap gap-3 mt-6">
              {topWeakSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => navigate({ to: "/resources" })}
                  className="bg-red-50 text-red-700 px-5 py-3 rounded-full font-semibold hover:bg-red-100 transition"
                >
                  ✗ {skill}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Click a skill to find free courses, YouTube tutorials, and project ideas.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mt-10">
          <button
            onClick={() => navigate({ to: "/resume" })}
            className="bg-white rounded-[32px] p-8 shadow-xl text-left hover:scale-[1.02] transition"
          >
            <h3 className="font-bold text-xl text-[#171C4A]">📄 Resume Score</h3>
            <div className="text-6xl font-black mt-6 text-[#171C4A]">
              {dashboardData.resume.score ? `${dashboardData.resume.score}%` : "—"}
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              {dashboardData.resume.hasResume
                ? `${dashboardData.resume.skillCount} skills identified`
                : "Upload resume to score"}
            </p>
          </button>

          <button
            onClick={() => navigate({ to: "/github" })}
            className="bg-white rounded-[32px] p-8 shadow-xl text-left hover:scale-[1.02] transition"
          >
            <h3 className="font-bold text-xl text-[#171C4A]">🐙 GitHub Score</h3>
            <div className="text-6xl font-black mt-6 text-[#171C4A]">
              {dashboardData.github.score}%
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              {dashboardData.github.totalRepositories} repos • {dashboardData.github.totalStars} stars
            </p>
          </button>

          <button
            onClick={() => navigate({ to: "/resources" })}
            className="bg-white rounded-[32px] p-8 shadow-xl text-left hover:scale-[1.02] transition"
          >
            <h3 className="font-bold text-xl text-[#171C4A]">🎯 Resources</h3>
            <div className="text-6xl font-black mt-6 text-[#171C4A]">
              {resourceCount || "—"}
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              {resourceCount > 0 ? `${completedCount}/${resourceCount} completed` : "Generate resources"}
            </p>
          </button>
        </div>

        <div className="mt-10 bg-white rounded-[32px] p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-[#171C4A]">🏅 Your Progress</h2>
          <div className="grid md:grid-cols-5 gap-6 mt-8">
            <div className={`p-6 rounded-3xl text-center ${dashboardData.resume.hasResume ? "bg-green-50" : "bg-[#F8F6E8]"}`}>
              📄
              <p className="mt-3 font-bold">{dashboardData.resume.hasResume ? "Resume Analyzed" : "Resume Pending"}</p>
            </div>
            <div className={`p-6 rounded-3xl text-center ${dashboardData.skillGap ? "bg-green-50" : "bg-[#F8F6E8]"}`}>
              🧠
              <p className="mt-3 font-bold">{dashboardData.skillGap ? "Skill Gap Done" : "Skill Gap Pending"}</p>
            </div>
            <div className={`p-6 rounded-3xl text-center ${dashboardData.github.totalRepositories > 0 ? "bg-green-50" : "bg-[#F8F6E8]"}`}>
              🐙
              <p className="mt-3 font-bold">{dashboardData.github.totalRepositories} GitHub Repos</p>
            </div>
            <div className={`p-6 rounded-3xl text-center ${dashboardData.assessment.latestScore !== null ? "bg-green-50" : "bg-[#F8F6E8]"}`}>
              🎯
              <p className="mt-3 font-bold">
                {dashboardData.assessment.latestScore !== null ? `Assessment ${dashboardData.assessment.latestScore}%` : "Assessment Pending"}
              </p>
            </div>
            <button
              onClick={() => navigate({ to: "/resources" })}
              className={`p-6 rounded-3xl text-center cursor-pointer hover:scale-[1.02] transition ${resourceCount > 0 ? "bg-green-50" : "bg-[#F8F6E8]"}`}
            >
              📚
              <p className="mt-3 font-bold">Resources</p>
              {resourceCount > 0 && <p className="text-xs text-gray-400 mt-1">{resourceCount} items</p>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}