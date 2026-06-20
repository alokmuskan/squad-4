import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/SkillGapDashboard")({
  component: SkillGapDashboard, 
});

function SkillGapDashboard() {
  const navigate = useNavigate();

  const weeklyProgress = [
    { week: 1, progress: 58 },
    { week: 2, progress: 63 },
    { week: 3, progress: 67 },
    { week: 4, progress: 72 },
  ];

  const maxProgress = Math.max(...weeklyProgress.map((w) => w.progress));

  const strongSkills = ["HTML", "CSS", "JavaScript", "Git", "React"];
  const needsImprovement = ["Node.js", "MongoDB", "Express"];
  const missingSkills = ["Docker", "AWS", "CI/CD", "Testing"];

  const skillAnalysis = [
    { name: "HTML/CSS", percentage: 95, status: "strong" },
    { name: "JavaScript", percentage: 90, status: "strong" },
    { name: "React", percentage: 82, status: "strong" },
    { name: "Node.js", percentage: 65, status: "improving" },
    { name: "MongoDB", percentage: 45, status: "improving" },
    { name: "Docker", percentage: 15, status: "weak" },
    { name: "AWS", percentage: 0, status: "weak" },
  ];

  const getColorByPercentage = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    if (percentage >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getTextColorByPercentage = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const overallMatch = 72;

  return (
    <div className="min-h-screen bg-[#F8F6E8] pb-20">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="px-5 py-3 bg-white shadow-lg rounded-2xl hover:scale-105 transition"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-black text-[#171C4A]">LearnFlow.</h1>
          <div className="w-20" />
        </div>
      </header>



      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[#171C4A] mb-3">
            Skill Gap Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Discover the skills you already have, identify missing competencies,
            and track your journey toward your target career.
          </p>
        </div>

        {/* SECTION 1: OVERALL SKILL MATCH HERO */}
        <section className="mb-12">
          <div
            className={`rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden ${
              overallMatch >= 80
                ? "bg-gradient-to-br from-green-600 to-green-700"
                : overallMatch >= 60
                  ? "bg-gradient-to-br from-[#F2DD85] to-yellow-500"
                  : "bg-gradient-to-br from-red-600 to-red-700"
            }`}
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 -mr-24 -mt-24 bg-white"></div>

            <div className="relative z-10">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Left: Circular Progress */}
                <div className="flex justify-center">
                  <div className="relative w-40 h-40">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 160 160"
                    >
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeDasharray={`${(overallMatch / 100) * 440} 440`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-black">{overallMatch}%</div>
                        <div className="text-sm opacity-90">Match Score</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Stats */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-black mb-2">Full Stack Developer</h2>
                    <p className="text-white/80">Target Role</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/20 rounded-2xl p-4">
                      <div className="text-3xl font-black">18</div>
                      <div className="text-sm opacity-90">Skills Identified</div>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-4">
                      <div className="text-3xl font-black">8</div>
                      <div className="text-sm opacity-90">Skills Missing</div>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-4">
                      <div className="text-3xl font-black">45%</div>
                      <div className="text-sm opacity-90">Learning Progress</div>
                    </div>
                    <div className="bg-white/20 rounded-2xl p-4">
                      <div className="text-3xl font-black">3 Mo.</div>
                      <div className="text-sm opacity-90">Est. Completion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SKILL GAP OVERVIEW */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Skill Gap Overview</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Strong Skills */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✓</span>
                <h3 className="text-2xl font-bold text-[#171C4A]">Strong Skills</h3>
              </div>
              <p className="text-gray-500 mb-4">({strongSkills.length} skills)</p>
              <div className="space-y-2">
                {strongSkills.map((skill) => (
                  <div
                    key={skill}
                    className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mr-2 mb-2"
                  >
                    ✓ {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Improvement */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠</span>
                <h3 className="text-2xl font-bold text-[#171C4A]">Needs Improvement</h3>
              </div>
              <p className="text-gray-500 mb-4">({needsImprovement.length} skills)</p>
              <div className="space-y-2">
                {needsImprovement.map((skill) => (
                  <div
                    key={skill}
                    className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mr-2 mb-2"
                  >
                    ⚠ {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">✗</span>
                <h3 className="text-2xl font-bold text-[#171C4A]">Missing Skills</h3>
              </div>
              <p className="text-gray-500 mb-4">({missingSkills.length} skills)</p>
              <div className="space-y-2">
                {missingSkills.map((skill) => (
                  <div
                    key={skill}
                    className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mr-2 mb-2"
                  >
                    ✗ {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SKILL MATCH ANALYSIS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Skill Match Analysis</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <div className="space-y-6">
              {skillAnalysis.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-[#171C4A]">{skill.name}</span>
                    <span
                      className={`font-bold ${getTextColorByPercentage(skill.percentage)}`}
                    >
                      {skill.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getColorByPercentage(
                        skill.percentage
                      )}`}
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: GITHUB + RESUME ANALYSIS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">
            Evidence-Based Skill Detection
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Detected From Resume */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <h3 className="text-xl font-bold text-[#171C4A] mb-4">📄 Resume Skills</h3>
              <div className="space-y-3">
                {[
                  { name: "React", confidence: 96 },
                  { name: "JavaScript", confidence: 94 },
                  { name: "HTML", confidence: 99 },
                  { name: "CSS", confidence: 97 },
                ].map((skill) => (
                  <div key={skill.name} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700">✓ {skill.name}</span>
                      <span className="text-green-600 font-bold">{skill.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected From GitHub */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <h3 className="text-xl font-bold text-[#171C4A] mb-4">🐙 GitHub Skills</h3>
              <div className="space-y-3">
                {[
                  { name: "React", confidence: 92 },
                  { name: "Node.js", confidence: 82 },
                  { name: "Git", confidence: 88 },
                ].map((skill) => (
                  <div key={skill.name} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700">✓ {skill.name}</span>
                      <span className="text-blue-600 font-bold">{skill.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Detected */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl">
              <h3 className="text-xl font-bold text-[#171C4A] mb-4">⚠ Not Detected</h3>
              <div className="space-y-3">
                {[
                  { name: "Docker", confidence: 0 },
                  { name: "AWS", confidence: 0 },
                  { name: "Unit Testing", confidence: 5 },
                ].map((skill) => (
                  <div key={skill.name} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-700">✗ {skill.name}</span>
                      <span className="text-red-600 font-bold">{skill.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${skill.confidence}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: LEARNING PRIORITY MATRIX */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Learning Priority Matrix</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learn First - High Priority */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-red-200">
              <h3 className="text-2xl font-bold text-[#171C4A] mb-4">🔥 Learn First</h3>
              <div className="space-y-3">
                {[
                  { name: "TypeScript", time: "3 weeks" },
                  { name: "Docker", time: "2 weeks" },
                ].map((skill) => (
                  <div key={skill.name} className="bg-red-50 rounded-2xl p-4">
                    <div className="font-semibold text-gray-800">{skill.name}</div>
                    <div className="text-sm text-red-600 mt-1">⏱ {skill.time}</div>
                    <span className="inline-block mt-3 px-3 py-1 bg-red-200 text-red-700 rounded-full text-xs font-bold">
                      HIGH
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn Next - Medium Priority */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-yellow-200">
              <h3 className="text-2xl font-bold text-[#171C4A] mb-4">⭐ Learn Next</h3>
              <div className="space-y-3">
                {[
                  { name: "AWS", time: "4 weeks" },
                  { name: "CI/CD", time: "3 weeks" },
                ].map((skill) => (
                  <div key={skill.name} className="bg-yellow-50 rounded-2xl p-4">
                    <div className="font-semibold text-gray-800">{skill.name}</div>
                    <div className="text-sm text-yellow-600 mt-1">⏱ {skill.time}</div>
                    <span className="inline-block mt-3 px-3 py-1 bg-yellow-200 text-yellow-700 rounded-full text-xs font-bold">
                      MEDIUM
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn Later - Low Priority */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-[#171C4A] mb-4">💡 Learn Later</h3>
              <div className="space-y-3">
                {[
                  { name: "Kubernetes", time: "5 weeks" },
                  { name: "GraphQL", time: "3 weeks" },
                ].map((skill) => (
                  <div key={skill.name} className="bg-blue-50 rounded-2xl p-4">
                    <div className="font-semibold text-gray-800">{skill.name}</div>
                    <div className="text-sm text-blue-600 mt-1">⏱ {skill.time}</div>
                    <span className="inline-block mt-3 px-3 py-1 bg-blue-200 text-blue-700 rounded-full text-xs font-bold">
                      LOW
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Skills */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-[#171C4A] mb-4">🎯 Optional Skills</h3>
              <div className="space-y-3">
                {[
                  { name: "Redis", time: "2 weeks" },
                  { name: "RabbitMQ", time: "2 weeks" },
                ].map((skill) => (
                  <div key={skill.name} className="bg-gray-50 rounded-2xl p-4">
                    <div className="font-semibold text-gray-800">{skill.name}</div>
                    <div className="text-sm text-gray-600 mt-1">⏱ {skill.time}</div>
                    <span className="inline-block mt-3 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                      OPTIONAL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CAREER READINESS SCORES */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Career Readiness Scores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Frontend Developer", score: 88 },
              { title: "Backend Developer", score: 65 },
              { title: "Full Stack Developer", score: 72 },
              { title: "DevOps Engineer", score: 22 },
            ].map((role) => (
              <div key={role.title} className="bg-white rounded-[32px] p-8 shadow-xl">
                <h3 className="font-bold text-gray-700 mb-4">{role.title}</h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="6"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={
                        role.score >= 80
                          ? "#22c55e"
                          : role.score >= 60
                            ? "#eab308"
                            : "#ef4444"
                      }
                      strokeWidth="6"
                      strokeDasharray={`${(role.score / 100) * 314} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-black">{role.score}%</div>
                    </div>
                  </div>
                </div>
                <div
                  className={`text-center font-bold ${
                    role.score >= 80
                      ? "text-green-600"
                      : role.score >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {role.score >= 80 ? "Ready" : role.score >= 60 ? "Improving" : "Get Started"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: PROJECT READINESS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Project Readiness</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Frontend Projects", score: 85 },
              { title: "Backend Projects", score: 65 },
              { title: "Database Projects", score: 58 },
              { title: "Cloud Deployment", score: 20 },
            ].map((project) => (
              <div key={project.title} className="bg-white rounded-[32px] p-8 shadow-xl">
                <h3 className="font-bold text-[#171C4A] mb-4">{project.title}</h3>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">{project.score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${
                        project.score >= 80
                          ? "bg-green-500"
                          : project.score >= 60
                            ? "bg-yellow-500"
                            : project.score >= 40
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${project.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 8: SKILL ROADMAP FLOW */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Skill Roadmap Flow</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl overflow-x-auto">
            <div className="flex items-center justify-start gap-4 min-w-max pb-4">
              {[
                { skill: "JavaScript", icon: "🟨" },
                { skill: "React", icon: "⚛️" },
                { skill: "Node.js", icon: "🟩" },
                { skill: "MongoDB", icon: "🍃" },
                { skill: "Docker", icon: "🐳" },
                { skill: "AWS", icon: "☁️" },
                { skill: "CI/CD", icon: "🔄" },
              ].map((item, index) => (
                <div key={item.skill} className="flex items-center gap-4">
                  <div className="bg-[#F8F6E8] rounded-2xl px-6 py-3 font-bold text-[#171C4A] flex items-center gap-2 whitespace-nowrap">
                    <span className="text-2xl">{item.icon}</span>
                    {item.skill}
                  </div>
                  {index < 6 && (
                    <div className="text-3xl text-gray-400 flex-shrink-0">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 9: AI INSIGHTS */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#F2DD85] to-yellow-400 rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="text-6xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-[#171C4A] mb-3">AI Career Coach</h3>
                <p className="text-[#171C4A] mb-6 leading-relaxed">
                  You already possess strong frontend skills. Learning Docker and AWS could increase
                  your Full Stack readiness score from 72% to 85% and improve employability for
                  modern software engineering roles.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-600">Potential Improvement</div>
                    <div className="text-3xl font-black text-[#171C4A]">+13%</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-600">Estimated Time</div>
                    <div className="text-3xl font-black text-[#171C4A]">6 Wks</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-600">Priority</div>
                    <div className="text-2xl font-black text-red-600">🔥 High</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: WEEKLY PROGRESS TRACKING */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Weekly Progress Tracking</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <div className="flex items-end justify-center gap-6 h-64">
              {weeklyProgress.map((week) => {
                const chartHeight = (week.progress / maxProgress) * 200;
                return (
                  <div key={week.week} className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 bg-gradient-to-t from-[#F2DD85] to-yellow-400 rounded-t-2xl transition-all duration-500"
                      style={{ height: `${chartHeight}px` }}
                    />
                    <div className="text-center">
                      <div className="font-bold text-[#171C4A]">{week.progress}%</div>
                      <div className="text-xs text-gray-500">Week {week.week}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <div className="bg-[#F8F6E8] rounded-2xl p-4">
                <div className="text-sm text-gray-600">Overall Growth</div>
                <div className="text-3xl font-black text-[#171C4A]">+14%</div>
              </div>
              <div className="bg-[#F8F6E8] rounded-2xl p-4">
                <div className="text-sm text-gray-600">Weekly Average</div>
                <div className="text-3xl font-black text-[#171C4A]">3.5%</div>
              </div>
              <div className="bg-[#F8F6E8] rounded-2xl p-4">
                <div className="text-sm text-gray-600">Consistency Score</div>
                <div className="text-3xl font-black text-green-600">95%</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: ACTION CENTER */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Action Center</h2>
          <div className="space-y-4">
            {[
              { title: "Learn Docker Basics", time: "5 Days", progress: 0 },
              { title: "Complete AWS Fundamentals", time: "7 Days", progress: 0 },
              { title: "Build Deployment Project", time: "10 Days", progress: 0 },
            ].map((action) => (
              <div
                key={action.title}
                className="bg-white rounded-[32px] p-6 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🔥</span>
                      <h3 className="text-xl font-bold text-[#171C4A]">{action.title}</h3>
                    </div>
                    <p className="text-gray-500 mb-4">
                      ⏱ Estimated time: {action.time}
                    </p>
                    <div className="flex gap-3 items-center">
                      <button className="bg-[#F2DD85] text-[#171C4A] px-6 py-2 rounded-full font-bold hover:opacity-90 transition">
                        Start
                      </button>
                      <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                        HIGH PRIORITY
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="4"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill="none"
                        stroke="#F2DD85"
                        strokeWidth="4"
                        strokeDasharray={`${(action.progress / 100) * 220} 220`}
                      />
                    </svg>
                    <div className="absolute mt-[-60px] ml-[12px] text-center w-16">
                      <div className="text-sm font-bold">{action.progress}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
