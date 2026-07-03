import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ChevronDown, ChevronUp, Lock, Circle, CheckCircle2,
  Loader2, Star, Globe, BookOpen, Target, Award, ArrowRight,
  Trash2, Zap, Clock, ChevronRight,
} from "lucide-react";

import { useRoadmaps, useRoadmapDetail, useGenerateRoadmap, useUpdatePhase, useDeleteRoadmap } from "@/hooks/use-queries";
import { getUserProfile } from "@/services/api";
import type { RoadmapPhase, RoadmapResponse } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const PHASE_ICONS = [Star, Globe, BookOpen, Target, Award, Zap];

const STATUS_CONFIG = {
  locked: { color: "from-gray-700/40 to-gray-800/20", border: "border-gray-700/50", glow: "shadow-none", icon: Lock, label: "Locked" },
  available: { color: "from-blue-900/30 to-indigo-900/20", border: "border-blue-500/30", glow: "shadow-blue-500/10", icon: Circle, label: "Available" },
  in_progress: { color: "from-cyan-900/30 to-blue-900/20", border: "border-cyan-400/50", glow: "shadow-cyan-400/20", icon: Loader2, label: "In Progress" },
  completed: { color: "from-emerald-900/30 to-green-900/20", border: "border-emerald-400/50", glow: "shadow-emerald-400/20", icon: CheckCircle2, label: "Completed" },
};

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 0.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
          }}
          animate={{ opacity: [0, 1, 0.3, 1, 0] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function NebulaOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/5 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-500/3 blur-[80px]" />
    </div>
  );
}

function EmptyState({ onGenerate }: { onGenerate: (goal: string, source: "ai" | "structured") => void }) {
  const [goalInput, setGoalInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: profile } = useQuery({
    queryKey: ["user", "profile"],
    queryFn: getUserProfile,
    enabled: !!localStorage.getItem("auth_token"),
  });

  const handleGenerate = async (source: "ai" | "structured") => {
    const goal = goalInput.trim() || profile?.careerGoal || "Frontend Engineer";
    setIsGenerating(true);
    try {
      await onGenerate(goal, source);
    } finally {
      setIsGenerating(false);
    }
  };

  const presetGoals = [
    "Frontend Engineer", "Backend Engineer", "AI / Machine Learning Engineer",
    "Full-Stack Developer", "DevOps / Platform Engineer", "Data Engineer",
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <div className="relative mb-8">
          <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-400/20">
            <Sparkles className="w-12 h-12 text-blue-300" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-400/10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">Launch Your Learning Journey</h1>
        <p className="text-gray-400 max-w-md mb-8">
          Generate a personalized, phase-by-phase roadmap powered by AI. Chart your course through the cosmos of skills.
        </p>

        <div className="w-full max-w-lg mx-auto mb-6">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder={profile?.careerGoal || `e.g. "Frontend Engineer"`}
            className="w-full px-5 py-3.5 bg-white/5 border border-blue-400/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/10 text-center text-lg backdrop-blur-sm"
            onKeyDown={(e) => e.key === "Enter" && goalInput.trim() && handleGenerate("ai")}
          />
        </div>

        <div className="flex gap-3 justify-center mb-8">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => handleGenerate("ai")}
            disabled={isGenerating}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isGenerating ? "Charting Course..." : "Generate AI Roadmap"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => handleGenerate("structured")}
            disabled={isGenerating}
            className="px-6 py-3 bg-white/5 border border-blue-400/20 text-blue-300 rounded-xl font-medium hover:bg-white/10 disabled:opacity-50"
          >
            Use Template
          </motion.button>
        </div>

        <p className="text-gray-500 text-sm mb-4">Quick select a preset:</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-xl">
          {presetGoals.map((g) => (
            <button
              key={g}
              onClick={() => { setGoalInput(g); handleGenerate("ai"); }}
              disabled={isGenerating}
              className="px-4 py-2 bg-white/5 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:border-blue-400/30 transition disabled:opacity-50"
            >
              {g}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function PhaseCard({
  phase,
  index,
  isExpanded,
  onToggle,
  onStatusChange,
}: {
  phase: RoadmapPhase;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: RoadmapPhase["status"]) => void;
}) {
  const statusCfg = STATUS_CONFIG[phase.status];
  const StatusIcon = statusCfg.icon;
  const PhaseIcon = PHASE_ICONS[index % PHASE_ICONS.length];
  const isLeft = index % 2 === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, x: isLeft ? -20 : 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ delay: index * 0.12, duration: 0.5, ease: "easeOut" }}
      className={`relative ${isLeft ? "lg:pr-[55%]" : "lg:pl-[55%]"} ${index === 0 ? "mt-0" : "mt-4"}`}
    >
      <div
        className={`relative p-0.5 rounded-2xl bg-gradient-to-b ${statusCfg.color} ${statusCfg.border} border ${statusCfg.glow} shadow-xl backdrop-blur-sm transition-all duration-300`}
      >
        <div className="bg-[#0B0E1A]/90 rounded-[14px] p-5">
          <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${phase.status === "completed" ? "from-emerald-500/20 to-green-500/20" : "from-blue-500/20 to-purple-500/20"}`}>
                <PhaseIcon className={`w-5 h-5 ${phase.status === "completed" ? "text-emerald-400" : "text-blue-300"}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white truncate">{phase.label}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{phase.duration}</span>
                  <span className={`flex items-center gap-1 ${phase.status === "completed" ? "text-emerald-400" : phase.status === "in_progress" ? "text-cyan-400" : "text-gray-500"}`}>
                    <StatusIcon className={`w-3 h-3 ${phase.status === "in_progress" ? "animate-spin" : ""}`} />
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {phase.status !== "locked" && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(); }}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                  <p className="text-gray-400 text-sm leading-relaxed">{phase.description}</p>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {phase.skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-xs text-blue-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Milestones</p>
                    <ul className="space-y-1.5">
                      {phase.milestones.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-1.5 shrink-0" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Resources</p>
                    <div className="space-y-1.5">
                      {phase.resources.map((r, i) => (
                        <a
                          key={i}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{r.label}</span>
                          <ArrowRight className="w-3 h-3 shrink-0 ml-auto" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {phase.status === "available" && (
                      <button onClick={() => onStatusChange("in_progress")} className="px-4 py-2 bg-cyan-500/10 border border-cyan-400/30 rounded-lg text-xs text-cyan-300 hover:bg-cyan-500/20 font-medium">
                        Start Phase
                      </button>
                    )}
                    {phase.status === "in_progress" && (
                      <button onClick={() => onStatusChange("completed")} className="px-4 py-2 bg-emerald-500/10 border border-emerald-400/30 rounded-lg text-xs text-emerald-300 hover:bg-emerald-500/20 font-medium">
                        Mark Complete
                      </button>
                    )}
                    {(phase.status === "in_progress" || phase.status === "completed") && (
                      <button onClick={() => onStatusChange("available")} className="px-4 py-2 bg-yellow-500/10 border border-yellow-400/20 rounded-lg text-xs text-yellow-300 hover:bg-yellow-500/20 font-medium">
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function PhaseConnection({ index, total }: { index: number; total: number }) {
  if (index >= total - 1) return null;
  return (
    <div className="flex justify-center py-1">
      <motion.div
        initial={{ height: 0 }} animate={{ height: 40 }}
        transition={{ delay: index * 0.12 + 0.3, duration: 0.4 }}
        className="w-0.5 bg-gradient-to-b from-blue-500/40 to-purple-500/20"
      />
    </div>
  );
}

function RoadmapView({
  roadmap,
  onDelete,
  onBack,
}: {
  roadmap: RoadmapResponse;
  onDelete: () => void;
  onBack: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const updatePhase = useUpdatePhase();
  const deleteRoadmap = useDeleteRoadmap();
  const handleStatusChange = (phaseId: string, status: RoadmapPhase["status"]) => {
    updatePhase.mutate({ roadmapId: roadmap.id, phaseId, status });
  };

  const handleDelete = () => {
    deleteRoadmap.mutate(roadmap.id, {
      onSuccess: () => onDelete(),
    });
  };

  const progressColor = roadmap.progress >= 80 ? "from-emerald-500 to-green-500" : roadmap.progress >= 40 ? "from-blue-500 to-purple-500" : "from-blue-500 to-cyan-500";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onBack} className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mb-2">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Roadmaps
          </button>
          <h1 className="text-2xl font-bold text-white">{roadmap.title}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {roadmap.goal} &middot; Estimated: {roadmap.duration} &middot; {roadmap.phases.length} phases
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400 font-medium">Progress</span>
          <span className="text-sm text-gray-400">{roadmap.progress}%</span>
        </div>
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${roadmap.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${progressColor}`}
          />
        </div>
      </div>

      <div className="relative">
        {roadmap.phases.map((phase, i) => (
          <div key={phase.id}>
            <PhaseCard
              phase={phase}
              index={i}
              isExpanded={expandedId === phase.id}
              onToggle={() => setExpandedId(expandedId === phase.id ? null : phase.id)}
              onStatusChange={(status) => handleStatusChange(phase.id, status)}
            />
            <PhaseConnection index={i} total={roadmap.phases.length} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RoadmapGeneratorPage() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const { data: roadmaps } = useRoadmaps();
  const { data: roadmapDetail, isLoading: loadingDetail } = useRoadmapDetail(selectedId);
  const generateRoadmap = useGenerateRoadmap();

  const handleGenerate = async (goal: string, source: "ai" | "structured") => {
    const result = await generateRoadmap.mutateAsync({ goal, source });
    setShowGenerator(false);
    setSelectedId(result.id);
    setView("detail");
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const handleBack = () => {
    setSelectedId(null);
    setView("list");
  };

  if (view === "detail" && selectedId) {
    if (loadingDetail || !roadmapDetail) {
      return (
        <div className="min-h-screen bg-[#06080F] relative flex items-center justify-center">
          <StarField />
          <NebulaOrbs />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <motion.div className="absolute inset-0 rounded-full border-2 border-blue-400/30 border-t-blue-400" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-300 animate-spin" />
              </div>
            </div>
            <p className="text-gray-400 text-sm">Loading roadmap...</p>
          </motion.div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#06080F] relative">
        <StarField />
        <NebulaOrbs />
        <RoadmapView
          roadmap={roadmapDetail}
          onDelete={handleBack}
          onBack={handleBack}
        />
      </div>
    );
  }

  if (roadmaps && roadmaps.length > 0 && view === "list" && !showGenerator) {
    return (
      <div className="min-h-screen bg-[#06080F] relative">
        <StarField />
        <NebulaOrbs />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">Your Roadmaps</h1>
              <p className="text-gray-400 text-sm mt-1">Select a roadmap to continue your journey</p>
            </div>
            <button
              onClick={() => setShowGenerator(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/20"
            >
              <Sparkles className="w-4 h-4" /> New Roadmap
            </button>
          </div>

          <div className="space-y-3">
            {roadmaps.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleSelect(r.id)}
                className="p-5 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 hover:border-blue-400/30 cursor-pointer transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-blue-300 transition">{r.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {r.goal} &middot; {r.duration} &middot; {r.phases.length} phases
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-300">{r.progress}%</div>
                      <div className="w-20 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${r.progress}%` }} />
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (generateRoadmap.isPending) {
    return (
      <div className="min-h-screen bg-[#06080F] relative flex items-center justify-center">
        <StarField />
        <NebulaOrbs />
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400/30 border-t-blue-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-purple-400/20 border-t-purple-400"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-300" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Charting Your Course</h2>
          <p className="text-gray-400 text-sm">AI is generating your personalized learning roadmap...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080F] relative">
      <StarField />
      <NebulaOrbs />
      <EmptyState onGenerate={handleGenerate} />
    </div>
  );
}
