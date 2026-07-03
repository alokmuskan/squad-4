import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSkillGapLatest } from "@/hooks/use-queries";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

interface SkillGapDashboardProps { onBack?: () => void }

interface SkillCategory {
  matched: string[];
  missing: string[];
}

interface SkillGapData {
  goal: string; matchScore: number; strong: string[]; improving: string[]; weak: string[];
  roadmap: { step: string; details: string; duration: string }[]; coach: string;
  details?: {
    gapPriority?: Record<string, "now" | "later">;
    priorityGaps?: { skill: string; importance: string; reason: string }[];
    skillCategories?: { core: SkillCategory; tools: SkillCategory; soft: SkillCategory };
    timeToGoal?: string;
  };
}

type Tab = "overview" | "skills" | "gaps";

const C = { strong: "#22C55E", improving: "#EAB308", weak: "#EF4444", now: "#EF4444", later: "#9CA3AF", primary: "#171C4A" };

function Card({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} className={className}>{children}</motion.div>;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <motion.div animate={{ opacity: [0.25, 0.5, 0.25] }} transition={{ repeat: Infinity, duration: 1.5 }} className={`bg-gray-200 rounded-2xl ${className}`} />;
}

function Tag({ name, color, bg, icon }: { name: string; color: string; bg: string; icon: string }) {
  return <span className={`${bg} ${color} px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1`}>{icon} {name}</span>;
}

function CategoryCard({ label, icon, matched, missing, borderColor }: { label: string; icon: string; matched: string[]; missing: string[]; borderColor: string }) {
  const total = matched.length + missing.length;
  const pct = total > 0 ? Math.round((matched.length / total) * 100) : 0;
  return (
    <div className={`bg-gray-50 rounded-xl p-4 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm text-[#171C4A]">{label}</span>
        </div>
        <span className="text-2xl font-black text-[#171C4A]">{pct}%</span>
      </div>
      <p className="text-sm text-gray-500 mt-0.5">{matched.length}/{total} skills matched</p>
      <div className="h-1 rounded-full bg-gray-200 mt-2 overflow-hidden">
        <div className={`h-full rounded-full bg-[#171C4A] transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SkillGapDashboard({ onBack }: SkillGapDashboardProps) {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSkillGapLatest();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ high: true });
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const cached = (() => {
    try {
      const r = localStorage.getItem("learnflow_skill_gap");
      if (!r) return null;
      const raw = JSON.parse(r);
      if (!raw?.skillGap || typeof raw.skillGap.matchScore !== "number") return null;
      return raw;
    } catch { return null; }
  })();
  const apiData = data as any;
  const rawSG = apiData?.skillGap || cached?.skillGap || null;
  const sg: SkillGapData | null = rawSG ? { ...rawSG, details: rawSG.details as SkillGapData["details"] } : null;
  const gp = sg?.details?.gapPriority || {};
  const sc = sg?.details?.skillCategories;
  const pg = sg?.details?.priorityGaps || [];

  const learnNow = (sg?.weak || []).filter((s) => gp[s] === "now");
  const learnLater = (sg?.weak || []).filter((s) => gp[s] !== "now");
  const totalSkills = (sg?.strong.length || 0) + (sg?.improving.length || 0) + (sg?.weak.length || 0);
  const goal = apiData?.careerGoal || cached?.careerGoal || sg?.goal || "";
  const match = sg?.matchScore ?? 0;

  const gaugeData = [{ name: "Match", value: match, color: match >= 80 ? C.strong : match >= 60 ? C.improving : C.weak }, { name: "", value: 100 - match, color: "#F3F4F6" }].filter(d => d.value > 0);
  const distPie = [{ n: "Proven", v: sg?.strong.length || 0, c: C.strong }, { n: "Building", v: sg?.improving.length || 0, c: C.improving }, { n: "Critical", v: learnNow.length, c: C.now }, { n: "Later", v: learnLater.length, c: C.later }].filter(d => d.v > 0);

  if (isLoading) return (
    <div className="min-h-screen bg-[#FAF9F2] pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <SkeletonBlock className="h-12 w-64 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <SkeletonBlock key={i} className="h-28 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonBlock key={i} className="h-56 rounded-[24px]" />)}
        </div>
        <SkeletonBlock className="h-64 rounded-[24px]" />
      </div>
    </div>
  );
  const errMsg = error instanceof Error ? error.message : error ? String(error) : apiData?.message || "";
  if (errMsg || !sg) return (
    <div className="min-h-screen bg-[#FAF9F2] flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] p-12 shadow-xl text-center max-w-md">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-bold text-[#171C4A] mb-2">No Analysis Yet</h3>
        <p className="text-gray-600 mb-6">{errMsg || "Run a resume analysis first."}</p>
        <button onClick={() => { if (onBack) onBack(); else navigate({ to: "/dashboard" }); }} className="px-8 py-3 bg-[#171C4A] text-white rounded-2xl font-bold cursor-pointer hover:bg-[#2a2f6a] transition">Go Back</button>
      </motion.div>
    </div>
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "skills", label: "Skills" },
    { key: "gaps", label: "Priority Gaps" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F2] pb-24">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => { if (onBack) onBack(); else navigate({ to: "/dashboard" }); }} className="px-5 py-2.5 bg-white shadow-md rounded-2xl hover:shadow-lg transition cursor-pointer text-sm font-semibold">← Dashboard</button>
          <h1 className="text-2xl font-black text-[#171C4A] tracking-tight">LearnFlow.</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black text-[#171C4A] tracking-tight">Skill Gap Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm">Benchmarked against real market data for <span className="font-bold text-[#171C4A]">{goal || sg.goal}</span></p>
        </motion.div>

        {/* Hero stat cards - always visible */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Skills", value: totalSkills, icon: "📊", color: "from-blue-500 to-blue-600" },
            { label: "Proven", value: sg.strong.length, icon: "✅", color: "from-green-400 to-green-500" },
            { label: "Building", value: sg.improving.length, icon: "🟡", color: "from-yellow-400 to-yellow-500" },
            { label: "Learn Now", value: learnNow.length, icon: "🔴", color: "from-red-500 to-red-600" },
            { label: "Learn Later", value: learnLater.length, icon: "⚪", color: "from-gray-400 to-gray-500" },
          ].map((s, i) => (
            <Card key={s.label} delay={i * 0.04} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-lg`}>
              <div className="flex items-center justify-between mb-1"><span className="text-xl">{s.icon}</span><span className="text-white text-xs font-semibold tracking-wide">{s.label}</span></div>
              <div className="text-3xl font-black">{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-bold transition border-b-2 ${
                  activeTab === tab.key
                    ? "text-[#171C4A] border-[#171C4A]"
                    : "text-gray-400 border-transparent hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              <Card delay={0.1} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/50 flex flex-col items-center justify-center min-h-[230px]">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Overall Match</h3>
                <div className="relative w-36 h-36">
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={gaugeData} cx="50%" cy="50%" innerRadius={50} outerRadius={64} startAngle={90} endAngle={-270} dataKey="value" stroke="none">{gaugeData.map((e, i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart></ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col"><span className="text-3xl font-black text-[#171C4A]">{match}%</span><span className="text-xs text-gray-500 font-semibold mt-0.5">match</span></div>
                </div>
              </Card>

              <Card delay={0.15} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/50 min-h-[230px]">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Distribution</h3>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distPie} cx="50%" cy="50%" innerRadius={28} outerRadius={42} dataKey="v" stroke="none">{distPie.map((e, i) => <Cell key={i} fill={e.c} />)}</Pie></PieChart></ResponsiveContainer></div>
                  <div className="space-y-1.5 text-sm flex-1">{distPie.map(d => <div key={d.n} className="flex items-center gap-2"><span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.c }} /><span className="text-gray-600 flex-1 font-medium">{d.n}</span><span className="font-bold text-[#171C4A]">{d.v}</span></div>)}</div>
                </div>
              </Card>

              <Card delay={0.2} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/50 min-h-[230px]">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Categories</h3>
                {sc ? (
                  <div className="space-y-3 pt-1">
                    <CategoryCard label="Core Skills" icon="🛡️" matched={sc.core.matched} missing={sc.core.missing} borderColor="border-[#171C4A]" />
                    <CategoryCard label="Tools & Tech" icon="🔧" matched={sc.tools.matched} missing={sc.tools.missing} borderColor="border-gray-400" />
                    <CategoryCard label="Soft Skills" icon="🧠" matched={sc.soft.matched} missing={sc.soft.missing} borderColor="border-teal-500" />
                  </div>
                ) : (
                  <div className="h-[170px] flex items-center justify-center text-gray-500 text-sm">No data</div>
                )}
              </Card>
            </div>

            <Card delay={0.3} className="mt-6">
              <div className="bg-gradient-to-br from-[#F2DD85] to-amber-300 rounded-[24px] p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex items-start gap-4">
                  <div className="text-4xl shrink-0">🤖</div>
                  <div><h3 className="text-xl font-black text-[#171C4A] mb-2">AI Career Coach</h3><p className="text-[#171C4A]/90 text-base leading-relaxed">{sg.coach}</p></div>
                </div>
              </div>
            </Card>
          </>
        )}

        {activeTab === "skills" && (
          <Card delay={0.15}>
            <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/50">
              {sc && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Category Breakdown</h3>
                  <div className="grid md:grid-cols-3 gap-3">
                    <CategoryCard label="Core Skills" icon="🛡️" matched={sc.core.matched} missing={sc.core.missing} borderColor="border-[#171C4A]" />
                    <CategoryCard label="Tools & Tech" icon="🔧" matched={sc.tools.matched} missing={sc.tools.missing} borderColor="border-gray-400" />
                    <CategoryCard label="Soft Skills" icon="🧠" matched={sc.soft.matched} missing={sc.soft.missing} borderColor="border-teal-500" />
                  </div>
                </div>
              )}
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Skill Tiers</h3>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { title: "Proven", icon: "✅", list: sg.strong, tagC: "text-green-700", tagB: "bg-green-100", tagI: "●", empty: "No proven skills" },
                  { title: "Building", icon: "🟡", list: sg.improving, tagC: "text-yellow-700", tagB: "bg-yellow-100", tagI: "●", empty: "No skills in this tier" },
                  { title: "Learn Now", icon: "🔴", list: learnNow, tagC: "text-red-700", tagB: "bg-red-100", tagI: "●", empty: "No critical gaps" },
                  { title: "Learn Later", icon: "⚪", list: learnLater, tagC: "text-gray-600", tagB: "bg-gray-100", tagI: "○", empty: "No skills in this tier" },
                ].map(col => (
                  <div key={col.title} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1"><span className="text-lg">{col.icon}</span><h3 className="font-bold text-sm text-[#171C4A]">{col.title}</h3><span className="ml-auto text-sm font-bold text-gray-500">({col.list.length})</span></div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {col.list.length > 0 ? col.list.map(s => <Tag key={s} name={s} color={col.tagC} bg={col.tagB} icon={col.tagI} />) : <span className="text-gray-500 text-sm italic">{col.empty}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "gaps" && (
          <Card delay={0.2} className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 shadow-lg border border-white/50">
            {pg.length > 0 ? (
              <>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Priority Gaps <span className="text-gray-400 font-medium normal-case">· {pg.length} total</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { key: "high", label: "High Priority", icon: "🔴", color: "bg-red-500", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
                    { key: "medium", label: "Medium Priority", icon: "🟡", color: "bg-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
                    { key: "low", label: "Low Priority", icon: "⚪", color: "bg-gray-300", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-500" },
                  ].map(group => {
                    const items = pg.filter(g => g.importance === group.key);
                    if (items.length === 0) return null;
                    const isOpen = openGroups[group.key] ?? (group.key === "high");
                    return (
                      <div key={group.key} className={`rounded-xl border ${group.border} overflow-hidden`}>
                        <button
                          onClick={() => setOpenGroups(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                          className={`w-full flex items-center justify-between px-4 py-3 ${group.bg} cursor-pointer transition`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{group.icon}</span>
                            <span className={`font-bold text-sm ${group.text}`}>{group.label}</span>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${group.bg} ${group.text} border ${group.border}`}>{items.length}</span>
                          </div>
                          <motion.span
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm ${group.text}`}
                          >▼</motion.span>
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
                              <div className="px-4 py-3 space-y-2.5 bg-white">
                                {items.map(g => (
                                  <div key={g.skill}>
                                    <span className="font-semibold text-sm text-[#171C4A]">{g.skill}</span>
                                    <p className="text-sm text-gray-500 mt-0.5">{g.reason}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[170px] flex items-center justify-center text-gray-500 text-sm">No priority gaps identified</div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
