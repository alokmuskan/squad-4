import { useState } from "react";
import { BookOpen, CheckCircle, Circle, ExternalLink, Sparkles, Loader2, ChevronDown, Search, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useResourceRecommendations, useMarkResourceComplete, useTriggerFullAnalysis, useUserProfile, useSkillGapLatest, useBookmarkResource } from "@/hooks/use-queries";
import type { ResourceItem } from "@/services/api";

const DIFFICULTY_STYLES: Record<string, { label: string; dot: string }> = {
  beginner: { label: "Beginner", dot: "bg-green-500" },
  intermediate: { label: "Intermediate", dot: "bg-yellow-500" },
  advanced: { label: "Advanced", dot: "bg-red-500" },
};

const TYPE_ICONS: Record<string, string> = {
  course: "🎓", tutorial: "📝", video: "🎬", book: "📖",
  documentation: "📄", article: "✍️", guide: "🗺️", project: "🛠️",
};

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "course", label: "Courses" },
  { value: "tutorial", label: "Tutorials" },
  { value: "video", label: "Videos" },
  { value: "project", label: "Projects" },
  { value: "book", label: "Books" },
  { value: "documentation", label: "Docs" },
];

const STATUS_CONFIG: Record<number, { label: string; cls: string; sectionCls: string; icon: string }> = {
  0: { label: "Building", cls: "bg-yellow-100 text-yellow-700", sectionCls: "border-l-4 border-yellow-400 bg-yellow-50/30", icon: "🟡" },
  1: { label: "Learn Now", cls: "bg-red-100 text-red-700", sectionCls: "border-l-4 border-red-400 bg-red-50/30", icon: "🔴" },
  2: { label: "Learn Later", cls: "bg-gray-100 text-gray-500", sectionCls: "border-l-4 border-gray-300 bg-gray-50/30", icon: "⚪" },
};

export default function ResourceList() {
  const { data: profile } = useUserProfile();
  const currentGoal = profile?.careerGoal || "";
  const { data, isLoading, error } = useResourceRecommendations(currentGoal);
  const markComplete = useMarkResourceComplete();
  const bookmark = useBookmarkResource();
  const triggerAnalysis = useTriggerFullAnalysis();
  const { data: sgData } = useSkillGapLatest();
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500 font-bold">
          <Loader2 size={20} className="animate-spin" />
          Loading resources...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF9F2] flex items-center justify-center px-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-10 shadow-lg border border-white/50 text-center max-w-md">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{error instanceof Error ? error.message : "Could not load resources."}</p>
        </div>
      </div>
    );
  }

  const diffRank: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
  const typeRank: Record<string, number> = { course: 0, tutorial: 1, documentation: 2, book: 3, video: 4, project: 5, guide: 6, article: 7 };

  const allResources = data.recommendations || [];
  const filtered = allResources.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && !r.skill.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<string, ResourceItem[]> = {};
  for (const r of filtered) {
    if (!grouped[r.skill]) grouped[r.skill] = [];
    grouped[r.skill].push(r);
  }
  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      const ad = diffRank[a.difficulty] ?? 1, bd = diffRank[b.difficulty] ?? 1;
      if (ad !== bd) return ad - bd;
      return (typeRank[a.type] ?? 99) - (typeRank[b.type] ?? 99);
    });
  }

  const sg = (sgData as any)?.skillGap || null;
  const gp = sg?.details?.gapPriority || {};
  const gpLower: Record<string, string> = {};
  for (const [k, v] of Object.entries(gp)) gpLower[k.toLowerCase()] = String(v);
  const improving = new Set((sg?.improving || []).map((s: string) => s.toLowerCase()));
  const weak = new Set((sg?.weak || []).map((s: string) => s.toLowerCase()));
  const skillRank: Record<string, number> = {};
  for (const key of Object.keys(grouped)) {
    const kl = key.toLowerCase();
    if (improving.has(kl)) skillRank[key] = 0;
    else if (weak.has(kl) && gpLower[kl] === "now") skillRank[key] = 1;
    else if (weak.has(kl)) skillRank[key] = 2;
    else skillRank[key] = 999;
  }
  const sortedEntries = Object.entries(grouped).sort(([a], [b]) => {
    const ra = skillRank[a] ?? 999, rb = skillRank[b] ?? 999;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });

  const sections: { rank: number; title: string; entries: typeof sortedEntries }[] = [];
  for (const rank of [0, 1, 2]) {
    const entries = sortedEntries.filter(([s]) => (skillRank[s] ?? 999) === rank);
    if (entries.length > 0) sections.push({ rank, title: STATUS_CONFIG[rank].label, entries });
  }
  const other = sortedEntries.filter(([s]) => (skillRank[s] ?? 999) >= 999);
  if (other.length > 0) sections.push({ rank: 999, title: "Other Skills", entries: other });

  return (
    <div className="min-h-screen bg-[#FAF9F2] pb-24">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#171C4A] tracking-tight">Learning Resources</h1>
        </div>

        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-sm border border-white/50 mb-8">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-600 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer font-medium shrink-0">Clear</button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-7">
          {TYPE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                filterType === opt.value
                  ? "bg-[#171C4A] text-white shadow-md"
                  : "text-gray-500 hover:text-[#171C4A] bg-white/60 border border-gray-200/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>



        {allResources.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-12 shadow-lg border border-white/50 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium mb-2">No resources generated yet.</p>
            <p className="text-gray-400 text-sm mb-6">Run the full analysis to get personalized learning recommendations for your goal: <strong className="text-[#171C4A]">{currentGoal}</strong></p>
            <button
              onClick={() => triggerAnalysis.mutate({ careerGoal: currentGoal })}
              disabled={triggerAnalysis.isPending}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#171C4A] text-white rounded-2xl font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer transition"
            >
              {triggerAnalysis.isPending ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
              {triggerAnalysis.isPending ? "Generating..." : "Generate Resources"}
            </button>
          </div>
        )}

        {allResources.length > 0 && filtered.length === 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] p-12 shadow-lg border border-white/50 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No resources match the selected filters.</p>
          </div>
        )}

        <div className="space-y-8">
          {sections.map(section => (
            <div key={section.rank}>
              <div className={`flex items-center gap-2 mb-4 px-5 py-3 rounded-2xl ${STATUS_CONFIG[section.rank]?.sectionCls || "bg-gray-50/50 border-l-4 border-gray-300"}`}>
                <span className="text-lg">{STATUS_CONFIG[section.rank]?.icon || "📚"}</span>
                <h2 className="text-lg font-black text-[#171C4A]">{section.title}</h2>
                <span className="text-xs font-bold text-gray-500 bg-white/60 px-2.5 py-1 rounded-full">{section.entries.reduce((sum, [, items]) => sum + items.length, 0)} resources</span>
              </div>
              <div className="space-y-3">
                {section.entries.map(([skill, resources]) => {
                  const status = STATUS_LABEL[skillRank[skill] ?? 999];
                  const done = resources.filter(r => r.completed).length;
                  const total = resources.length;
                  const isOpen = openGroups[skill] ?? (skillRank[skill] === 0);
                  return (
                    <div key={skill} className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-lg border border-white/50 overflow-hidden transition hover:shadow-xl">
                      <button
                        onClick={() => setOpenGroups(prev => ({ ...prev, [skill]: !prev[skill] }))}
                        className="w-full flex items-center justify-between px-6 py-4 cursor-pointer transition hover:bg-gray-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-[#171C4A]">{skill}</h3>
                          {status && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#171C4A] transition-all duration-300" style={{ width: `${(done / total) * 100}%` }} />
                            </div>
                            <span>{done}/{total}</span>
                          </div>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={20} className="text-gray-400" />
                          </motion.div>
                        </div>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {resources.map(resource => {
                                const diff = DIFFICULTY_STYLES[resource.difficulty] || DIFFICULTY_STYLES.beginner;
                                return (
                                  <div
                                    key={resource.id}
                                    className={`p-4 rounded-2xl border transition ${
                                      resource.completed
                                        ? "bg-green-50/50 border-green-200"
                                        : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <button
                                        onClick={() => markComplete.mutate({ id: resource.id, completed: !resource.completed })}
                                        className="mt-px shrink-0 cursor-pointer"
                                      >
                                        {resource.completed ? (
                                          <CheckCircle size={20} className="text-green-500" />
                                        ) : (
                                          <Circle size={20} className="text-gray-300 hover:text-gray-400" />
                                        )}
                                      </button>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-base shrink-0">{TYPE_ICONS[resource.type] || "📄"}</span>
                                          <a
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-semibold text-sm text-[#171C4A] truncate hover:underline"
                                          >
                                            {resource.title}
                                          </a>
                                          <ExternalLink size={12} className="text-gray-400 shrink-0" />
                                          <button
                                            onClick={() => bookmark.mutate({ id: resource.id, bookmarked: !resource.bookmarked })}
                                            className="ml-auto shrink-0 cursor-pointer"
                                          >
                                            <Star
                                              size={14}
                                              className={resource.bookmarked ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"}
                                            />
                                          </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{resource.reason}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
                                            {diff.label}
                                          </span>
                                          <span className="text-xs text-gray-400">{resource.platform}</span>
                                          {resource.duration && (
                                            <span className="text-xs text-gray-400">⏱ {resource.duration}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<number, { label: string; cls: string }> = {
  0: { label: "Building", cls: "bg-yellow-100 text-yellow-700" },
  1: { label: "Learn Now", cls: "bg-red-100 text-red-700" },
  2: { label: "Learn Later", cls: "bg-gray-100 text-gray-500" },
};
