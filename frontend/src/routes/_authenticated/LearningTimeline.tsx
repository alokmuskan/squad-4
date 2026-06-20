import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type ElementType } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Compass,
  Pen,
  Palette,
  Code,
  Layers,
  Brain,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Trophy,
  MapPin,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/LearningTimeline")({
  component: LearningTimeline,
});



type Status = "done" | "inProgress" | "upcoming";

interface RoadmapStop {
  id: number;
  label: string;
  phase: string;
  duration: string;
  side: "left" | "right";
  defaultStatus: Status;
  icon: ElementType;
  skills: string[];
  tip: string;
}

const ROADMAPS: Record<string, RoadmapStop[]> = {
  "UI/UX Designer": [
    {
      id: 1, label: "Basics", phase: "Foundation", duration: "2 weeks",
      side: "left", defaultStatus: "done", icon: BookOpen,
      skills: ["Design Principles", "UI Basics", "Figma"], tip: "Start with Figma first.",
    },
    {
      id: 2, label: "Research", phase: "Discovery", duration: "2 weeks",
      side: "right", defaultStatus: "done", icon: Compass,
      skills: ["User Research", "Personas"], tip: "Talk to users.",
    },
    {
      id: 3, label: "Wireframing", phase: "Ideation", duration: "3 weeks",
      side: "left", defaultStatus: "inProgress", icon: Pen,
      skills: ["Low-fi", "Sketching"], tip: "Speed matters.",
    },
    {
      id: 4, label: "UI Design", phase: "Visual", duration: "4 weeks",
      side: "right", defaultStatus: "upcoming", icon: Palette,
      skills: ["Colors", "Typography"], tip: "Master spacing.",
    },
  ],

  "Frontend Developer": [
    {
      id: 1, label: "HTML/CSS", phase: "Foundation", duration: "2 weeks",
      side: "left", defaultStatus: "done", icon: Code,
      skills: ["HTML", "CSS", "Flexbox"], tip: "Build layouts first.",
    },
    {
      id: 2, label: "JavaScript", phase: "Logic", duration: "3 weeks",
      side: "right", defaultStatus: "inProgress", icon: Code,
      skills: ["Variables", "Functions", "DOM"], tip: "Practice daily.",
    },
    {
      id: 3, label: "React", phase: "Framework", duration: "4 weeks",
      side: "left", defaultStatus: "upcoming", icon: Layers,
      skills: ["Hooks", "Routing"], tip: "Build projects.",
    },
  ],

  "AI Engineer": [
    {
      id: 1, label: "Python", phase: "Foundation", duration: "2 weeks",
      side: "left", defaultStatus: "done", icon: Brain,
      skills: ["Syntax", "OOP"], tip: "Strong Python basics.",
    },
    {
      id: 2, label: "Machine Learning", phase: "Core", duration: "4 weeks",
      side: "right", defaultStatus: "inProgress", icon: Brain,
      skills: ["Regression", "Classification"], tip: "Understand algorithms.",
    },
    {
      id: 3, label: "Deep Learning", phase: "Advanced", duration: "5 weeks",
      side: "left", defaultStatus: "upcoming", icon: Brain,
      skills: ["CNN", "RNN"], tip: "Build models.",
    },
  ],
};

function TimelineNode({ stop }: { stop: RoadmapStop }) {
  const Icon = stop.icon;
  const isLeft = stop.side === "left";

  const cardStyles =
    stop.defaultStatus === "done" ? "bg-emerald-50 border-emerald-200 shadow-emerald-100"
    : stop.defaultStatus === "inProgress" ? "bg-amber-50 border-amber-200 shadow-amber-100"
    : "bg-white border-slate-200 shadow-slate-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative flex items-center mb-12 md:mb-16 ${isLeft ? "justify-start" : "justify-end"}`}
    >
      <div className={`w-full md:w-[42%] ${isLeft ? "mr-auto" : "ml-auto"}`}>
        <Card className={`rounded-lg border shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${cardStyles}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-[#171C4A] text-white"><Icon className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-slate-500">Step {String(stop.id).padStart(2, "0")} - {stop.phase}</p>
                <h3 className="font-black text-xl text-[#171C4A]">{stop.label}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-3">⏱ {stop.duration}</p>
            <ul className="space-y-2 text-sm font-semibold text-slate-700">
              {stop.skills.map((skill) => <li key={skill}>• {skill}</li>)}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 z-20">
        <div className="w-12 h-12 rounded-full bg-[#171C4A] shadow-xl flex items-center justify-center border-4 border-white">
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function LearningTimeline() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState("UI/UX Designer");
 const STOPS_BASE = ROADMAPS[userRole as keyof typeof ROADMAPS]; 

  const createInitialStatusMap = (roadmap: RoadmapStop[]) => {
    const initial: Record<number, Status> = {};
    roadmap.forEach((stop) => {
      initial[stop.id] = stop.defaultStatus;
    });
    return initial;
  };

  const [statusMap, setStatusMap] = useState<Record<number, Status>>(
    createInitialStatusMap(STOPS_BASE)
  );

  useEffect(() => {
    setStatusMap(createInitialStatusMap(STOPS_BASE));
  }, [userRole]);

  const handleReset = () => {
    setStatusMap(createInitialStatusMap(STOPS_BASE));
  };

  const doneCount = Object.values(statusMap).filter((s) => s === "done").length;
  const progressPct = Math.round((doneCount / STOPS_BASE.length) * 100);

  return (
    <div className="min-h-screen bg-[#F7F4EA] text-[#171C4A] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard" })}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-[#171C4A] hover:text-[#171C4A]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-xl font-black">LearnFlow Timeline</h1>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md bg-[#171C4A] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#232a68]"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <div className="max-w-lg mx-auto mb-6">
          <select value={userRole} onChange={(e) => setUserRole(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-bold text-[#171C4A] shadow-sm outline-none transition focus:border-[#7C5CFC] focus:ring-4 focus:ring-[#7C5CFC]/15">
            {Object.keys(ROADMAPS).map((role) => <option key={role}>{role}</option>)}
          </select>
        </div>

        <div className="text-center mb-12 rounded-lg bg-[#171C4A] px-6 py-10 text-white shadow-xl">
          <Badge className="mb-3 bg-white/10 text-white border-white/15">
            <Sparkles className="w-3 h-3 mr-1" />AI Generated Roadmap
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-white">{userRole} Journey</h1>
          <p className="text-sm text-white/70 mt-3">{STOPS_BASE.length} milestones to your next role</p>

          <div className="max-w-md mx-auto mt-6 bg-white/10 p-5 rounded-lg">
            <Progress value={progressPct} />
            <p className="text-sm mt-2">{progressPct}% completed</p>
          </div>
        </div>

        <div className="relative py-16">
          <svg className="absolute left-1/2 -translate-x-1/2 h-full" width="180" height="100%"
            viewBox="0 0 180 1200" fill="none">
            <path d="M90 0 C140 120 40 180 90 300 C140 420 40 480 90 600 C140 720 40 780 90 900 C140 1020 40 1080 90 1200"
              stroke="#E9D5FF" strokeWidth="16" strokeLinecap="round" fill="none" />
          </svg>

          <div className="relative z-10">
            {STOPS_BASE.map((stop) => <TimelineNode key={stop.id} stop={stop} />)}
          </div>
        </div>

        <div className="text-center mt-10">
          <Trophy className="w-10 h-10 mx-auto text-yellow-500" />
          <h2 className="font-bold mt-3">Goal</h2>
          <p className="text-sm text-gray-500">Become a {userRole} and kickstart your career</p>
        </div>
      </div>
    </div>
  );
}
