import { useNavigate } from "@tanstack/react-router";
import { useProgressHistory } from "@/hooks/use-queries";

interface ProgressHistoryProps {
  onBack?: () => void;
}

export default function ProgressHistory({ onBack }: ProgressHistoryProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useProgressHistory();

  const progress = data?.progress || [];
  const currentScore = data?.currentScore ?? 0;
  const trend = data?.trend ?? "stable";

  const trendEmoji = trend === "up" ? "📈" : trend === "down" ? "📉" : "➡️";
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600";

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
          <h1 className="text-5xl font-black text-[#171C4A] mb-3">📊 Progress History</h1>
          <p className="text-lg text-gray-600">
            Track how your skill gap score has changed over time.
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-pulse">📊</div>
            <p className="text-gray-500 font-bold">Loading progress...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center">
            <p>Failed to load progress history.</p>
          </div>
        )}

        {!isLoading && !error && progress.length === 0 && (
          <div className="bg-white rounded-[32px] p-10 shadow-xl text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-2xl font-bold text-[#171C4A] mb-2">No History Yet</h3>
            <p className="text-gray-500">Run multiple skill gap analyses to see your progress over time.</p>
          </div>
        )}

        {!isLoading && !error && progress.length > 0 && (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-[32px] p-8 shadow-xl text-center">
                <p className="text-gray-500 text-sm mb-1">Current Score</p>
                <div className="text-5xl font-black text-[#171C4A]">{currentScore}%</div>
              </div>
              <div className="bg-white rounded-[32px] p-8 shadow-xl text-center">
                <p className="text-gray-500 text-sm mb-1">Analyses</p>
                <div className="text-5xl font-black text-[#171C4A]">{progress.length}</div>
              </div>
              <div className="bg-white rounded-[32px] p-8 shadow-xl text-center">
                <p className="text-gray-500 text-sm mb-1">Trend</p>
                <div className={`text-5xl font-black ${trendColor}`}>
                  {trendEmoji} {trend.charAt(0).toUpperCase() + trend.slice(1)}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-[#171C4A] mb-6">Score Timeline</h2>
              <div className="space-y-4">
                {[...progress].reverse().map((point, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-500 shrink-0">
                      {new Date(point.date).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all ${
                            point.matchScore >= 80 ? "bg-green-500"
                              : point.matchScore >= 60 ? "bg-yellow-500"
                              : point.matchScore >= 40 ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${point.matchScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-right font-bold text-[#171C4A] shrink-0">
                      {point.matchScore}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
