import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useJobMatches, useSkillGapLatest } from "@/hooks/use-queries";
import { CAREER_GOALS } from "@/services/api";

interface JobMatchesProps {
  onBack?: () => void;
}

export default function JobMatches({ onBack }: JobMatchesProps) {
  const navigate = useNavigate();
  const { data: skillGapData } = useSkillGapLatest();
  const cachedGoal = (() => {
    try {
      return localStorage.getItem("learnflow_career_goal") || "";
    } catch {
      return "";
    }
  })();
  const [selectedGoal, setSelectedGoal] = useState(
    (skillGapData as { careerGoal?: string } | null)?.careerGoal || cachedGoal
  );
  const { data, isLoading, error } = useJobMatches(selectedGoal);

  const matches = data?.matches || [];
  const totalMatches = data?.totalMatches || 0;

  return (
    <div className="min-h-screen bg-[#F8F6E8] pb-20">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (onBack) onBack();
              else navigate({ to: "/skill-gap" });
            }}
            className="px-5 py-3 bg-white shadow-lg rounded-2xl hover:scale-105 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-black text-[#171C4A]">LearnFlow.</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-5xl font-black text-[#171C4A] mb-3">🎯 Job Matches</h1>
          <p className="text-lg text-gray-600">
            Indian job market — see how your skills match real company requirements.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-[#171C4A] mb-2">
            Target Role
          </label>
          <select
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-xl px-4 py-3 bg-white text-sm"
          >
            {CAREER_GOALS.map((goal) => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-pulse">🔍</div>
            <p className="text-gray-500 font-bold">Finding job matches...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
            <p>Failed to load job matches. Try again later.</p>
          </div>
        )}

        {!isLoading && !error && matches.length === 0 && selectedGoal && (
          <div className="bg-white rounded-[32px] p-10 shadow-xl text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-[#171C4A] mb-2">No Matches Yet</h3>
            <p className="text-gray-500">Run a skill gap analysis first to see company matches for {selectedGoal}.</p>
          </div>
        )}

        {!isLoading && !error && matches.length > 0 && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-[#171C4A] text-white px-4 py-2 rounded-full text-sm font-bold">
                {totalMatches} matches
              </span>
              <span className="text-gray-500 text-sm">for {selectedGoal}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {matches.map((match, i) => {
                const matchPct = match.matchScore;
                const barColor = matchPct >= 80 ? "bg-green-500"
                  : matchPct >= 60 ? "bg-yellow-500"
                  : matchPct >= 40 ? "bg-orange-500"
                  : "bg-red-500";

                return (
                  <div key={i} className="bg-white rounded-[32px] p-6 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#171C4A]">{match.company}</h3>
                        <p className="text-gray-500 text-sm mt-1">{match.title}</p>
                      </div>
                      <div className={`text-3xl font-black ${matchPct >= 60 ? "text-green-600" : "text-orange-600"}`}>
                        {matchPct}%
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${matchPct}%` }} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                        📍 {match.location}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                        🎯 {match.experienceLevel}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {match.matchedSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-600 mb-1">✓ Matched</p>
                          <div className="flex flex-wrap gap-1">
                            {match.matchedSkills.map((s) => (
                              <span key={s} className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {match.missingSkills.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-600 mb-1">✗ Missing</p>
                          <div className="flex flex-wrap gap-1">
                            {match.missingSkills.map((s) => (
                              <span key={s} className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-xs">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs text-gray-400">
                      {match.matchedSkills.length}/{match.totalRequiredSkills} required skills
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
