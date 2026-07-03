interface Props {
  skillCount: number;
  careerFitScore: number | null;
  resumeScore: number | null;
  experienceCount: number;
  analyzed: boolean;
}

export default function ResumeMetricCards({
  skillCount,
  careerFitScore,
  resumeScore,
  experienceCount,
  analyzed,
}: Props) {
  const cards = [
    { label: "Skills Found", value: analyzed ? skillCount : "—", color: "from-blue-500 to-blue-600" },
    { label: "Career Fit", value: careerFitScore !== null ? `${careerFitScore}%` : "—", color: "from-purple-500 to-purple-600" },
    { label: "Resume Score", value: analyzed && resumeScore ? `${resumeScore}%` : "—", color: "from-green-400 to-green-500" },
    { label: "Experience", value: analyzed ? experienceCount : "—", color: "from-amber-500 to-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-xl p-4 text-white`}>
          <p className="text-white/70 text-xs">{c.label}</p>
          <h3 className="text-2xl font-bold mt-1">{c.value}</h3>
        </div>
      ))}
    </div>
  );
}
