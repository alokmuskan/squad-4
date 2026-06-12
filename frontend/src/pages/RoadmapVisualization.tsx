interface RoadmapVisualizationProps {
  onBack: () => void;
}

export default function RoadmapVisualization({ onBack }: RoadmapVisualizationProps) {
  // Roadmap data structure
  const roadmapSkills = [
    { name: "HTML/CSS", status: "completed", duration: "2 weeks", difficulty: "Easy" },
    { name: "JavaScript", status: "completed", duration: "3 weeks", difficulty: "Medium" },
    { name: "React", status: "completed", duration: "4 weeks", difficulty: "Medium" },
    { name: "Node.js", status: "inProgress", duration: "3 weeks", difficulty: "Medium" },
    { name: "Express", status: "upcoming", duration: "2 weeks", difficulty: "Medium" },
    { name: "MongoDB", status: "upcoming", duration: "2 weeks", difficulty: "Medium" },
    { name: "Docker", status: "upcoming", duration: "2 weeks", difficulty: "Hard" },
    { name: "AWS", status: "locked", duration: "3 weeks", difficulty: "Hard" },
    { name: "CI/CD", status: "locked", duration: "2 weeks", difficulty: "Hard" },
  ];

  const phases = [
    {
      name: "Foundations",
      skills: ["HTML", "CSS", "JavaScript"],
      status: "completed",
    },
    {
      name: "Frontend Development",
      skills: ["React", "State Management"],
      status: "completed",
    },
    {
      name: "Backend Development",
      skills: ["Node.js", "Express", "MongoDB"],
      status: "inProgress",
    },
    {
      name: "Cloud & Deployment",
      skills: ["Docker", "AWS", "CI/CD"],
      status: "locked",
    },
  ];

  const weeklyTimeline = [
    { week: "1-2", title: "Node.js Fundamentals" },
    { week: "3", title: "REST APIs" },
    { week: "4", title: "MongoDB" },
    { week: "5", title: "Authentication" },
    { week: "6", title: "Docker" },
    { week: "7-8", title: "AWS Deployment" },
  ];

  const projects = [
    { name: "Portfolio Website", status: "completed" },
    { name: "Task Manager App", status: "completed" },
    { name: "Full Stack Blog", status: "inProgress" },
    { name: "E-Commerce Platform", status: "upcoming" },
    { name: "Cloud Deployed SaaS", status: "locked" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✔";
      case "inProgress":
        return "🔄";
      case "upcoming":
        return "⭐";
      case "locked":
        return "🔒";
      default:
        return "•";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "inProgress":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "upcoming":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "locked":
        return "bg-gray-100 text-gray-600 border-gray-300";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6E8] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
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
            Roadmap Visualization
          </h1>
          <p className="text-lg text-gray-600">
            Your personalized AI-generated learning journey from your current skills to your
            dream career.
          </p>
        </div>

        {/* SECTION 1: HERO LEARNING JOURNEY */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#171C4A] to-blue-900 rounded-[40px] p-10 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 -mr-32 -mt-32 bg-white"></div>

            <div className="relative z-10">
              <div className="grid md:grid-cols-5 gap-4 items-center">
                {/* Current Role */}
                <div className="text-center">
                  <div className="text-4xl mb-3">🧑‍💻</div>
                  <div className="font-black text-lg">Frontend Developer</div>
                  <div className="text-white/70 text-sm">Current Role</div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="text-3xl animate-bounce">→</div>
                </div>

                {/* Journey Progress */}
                <div className="text-center bg-white/10 rounded-2xl p-6">
                  <div className="text-5xl font-black mb-2">42%</div>
                  <div className="text-white/80">Journey Progress</div>
                  <div className="mt-3 h-2 bg-white/20 rounded-full">
                    <div className="h-2 bg-[#F2DD85] rounded-full w-[42%]"></div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="text-3xl animate-bounce">→</div>
                </div>

                {/* Target Role */}
                <div className="text-center">
                  <div className="text-4xl mb-3">🚀</div>
                  <div className="font-black text-lg">Full Stack Developer</div>
                  <div className="text-white/70 text-sm">Target Role</div>
                </div>
              </div>

              <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm opacity-80">Estimated Completion</div>
                    <div className="text-3xl font-black mt-1">10 Weeks</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Remaining Time</div>
                    <div className="text-3xl font-black mt-1">5 Weeks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: AI ROADMAP OVERVIEW */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">AI Roadmap Overview</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-[32px] p-6 shadow-xl text-center">
              <div className="text-4xl mb-3">✔</div>
              <div className="text-2xl font-black text-green-600">4</div>
              <div className="text-gray-600">Completed Skills</div>
            </div>
            <div className="bg-white rounded-[32px] p-6 shadow-xl text-center">
              <div className="text-4xl mb-3">🔄</div>
              <div className="text-2xl font-black text-yellow-600">1</div>
              <div className="text-gray-600">In Progress</div>
            </div>
            <div className="bg-white rounded-[32px] p-6 shadow-xl text-center">
              <div className="text-4xl mb-3">⭐</div>
              <div className="text-2xl font-black text-blue-600">2</div>
              <div className="text-gray-600">Upcoming Skills</div>
            </div>
            <div className="bg-white rounded-[32px] p-6 shadow-xl text-center">
              <div className="text-4xl mb-3">🔒</div>
              <div className="text-2xl font-black text-gray-600">2</div>
              <div className="text-gray-600">Locked Skills</div>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE ROADMAP VISUALIZATION */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Interactive Roadmap</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <div className="space-y-4">
              {roadmapSkills.map((skill, index) => (
                <div key={skill.name}>
                  <div
                    className={`rounded-2xl p-4 border-2 cursor-pointer hover:shadow-lg transition-all ${getStatusColor(
                      skill.status
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStatusIcon(skill.status)}</span>
                        <div>
                          <div className="font-bold">{skill.name}</div>
                          <div className="text-xs opacity-70">
                            {skill.duration} • {skill.difficulty}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold capitalize px-3 py-1 bg-white/50 rounded-full">
                        {skill.status === "inProgress"
                          ? "In Progress"
                          : skill.status === "completed"
                            ? "Done"
                            : skill.status === "upcoming"
                              ? "Coming"
                              : "Locked"}
                      </span>
                    </div>
                  </div>
                  {index < roadmapSkills.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="text-2xl text-gray-400">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: ROADMAP PHASES */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Learning Phases</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {phases.map((phase) => (
              <div
                key={phase.name}
                className={`rounded-[32px] p-8 shadow-xl transition-all ${
                  phase.status === "completed"
                    ? "bg-green-50 border-2 border-green-300"
                    : phase.status === "inProgress"
                      ? "bg-yellow-50 border-2 border-yellow-300"
                      : "bg-gray-50 border-2 border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">
                    {phase.status === "completed"
                      ? "✔"
                      : phase.status === "inProgress"
                        ? "🔄"
                        : "🔒"}
                  </span>
                  <h3 className="text-xl font-bold text-[#171C4A]">{phase.name}</h3>
                </div>
                <div className="space-y-2">
                  {phase.skills.map((skill) => (
                    <div
                      key={skill}
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        phase.status === "completed"
                          ? "bg-green-200 text-green-700"
                          : phase.status === "inProgress"
                            ? "bg-yellow-200 text-yellow-700"
                            : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: SKILL DEPENDENCY MAP */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Skill Dependencies</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <div className="space-y-4">
              {[
                {
                  skill: "Docker",
                  prereqs: ["Node.js", "Git"],
                  duration: "7 Days",
                  difficulty: "Medium",
                },
                {
                  skill: "AWS",
                  prereqs: ["Docker", "Linux"],
                  duration: "10 Days",
                  difficulty: "Hard",
                },
                {
                  skill: "MongoDB",
                  prereqs: ["JavaScript", "Node.js"],
                  duration: "5 Days",
                  difficulty: "Medium",
                },
              ].map((item) => (
                <div key={item.skill} className="bg-[#F8F6E8] rounded-2xl p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-bold text-[#171C4A] mb-4">{item.skill}</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-gray-600 font-semibold">Prerequisites</div>
                      <div className="mt-2 space-y-1">
                        {item.prereqs.map((p) => (
                          <div key={p} className="text-sm font-semibold">
                            ✔ {p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-semibold">Duration</div>
                      <div className="text-lg font-black text-[#171C4A] mt-2">{item.duration}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 font-semibold">Difficulty</div>
                      <div
                        className={`text-lg font-bold mt-2 ${
                          item.difficulty === "Hard"
                            ? "text-red-600"
                            : item.difficulty === "Medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {item.difficulty}
                      </div>
                    </div>
                    <button className="bg-[#F2DD85] text-[#171C4A] font-bold rounded-xl px-4 py-2 hover:opacity-90 transition">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: AI RECOMMENDED PATH */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#F2DD85] to-yellow-400 rounded-[40px] p-10 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="text-6xl">🤖</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-[#171C4A] mb-3">AI Learning Coach</h3>
                <p className="text-[#171C4A] mb-6 leading-relaxed">
                  Based on your resume and GitHub profile, your frontend skills are strong. Focus on
                  Node.js, MongoDB, Docker, and AWS to maximize employability.
                </p>
                <div className="bg-white/60 rounded-2xl p-6 mb-6">
                  <h4 className="font-bold text-[#171C4A] mb-4">Priority Learning Order:</h4>
                  <ol className="space-y-2 text-[#171C4A]">
                    <li className="font-semibold">1. Node.js (Critical)</li>
                    <li className="font-semibold">2. Express.js (Important)</li>
                    <li className="font-semibold">3. MongoDB (Important)</li>
                    <li className="font-semibold">4. Docker (Strategic)</li>
                    <li className="font-semibold">5. AWS (Strategic)</li>
                  </ol>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-600">Career Growth</div>
                    <div className="text-3xl font-black text-[#171C4A]">+15%</div>
                  </div>
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="text-sm font-semibold text-gray-600">Employability Boost</div>
                    <div className="text-3xl font-black text-[#171C4A]">+22%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: WEEKLY LEARNING TIMELINE */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Weekly Timeline</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-[#F2DD85] to-yellow-500"></div>

              <div className="space-y-8">
                {weeklyTimeline.map((item) => (
                  <div key={item.week} className="flex gap-6 items-start">
                    <div className="relative z-10 bg-[#F2DD85] rounded-full w-24 h-24 flex items-center justify-center font-bold text-[#171C4A] flex-shrink-0 shadow-lg">
                      Week {item.week}
                    </div>
                    <div className="bg-[#F8F6E8] rounded-2xl p-6 flex-1">
                      <h3 className="text-xl font-bold text-[#171C4A]">{item.title}</h3>
                      <p className="text-gray-600 mt-2">Complete lessons, projects, and assessments</p>
                      <button className="mt-4 bg-[#F2DD85] text-[#171C4A] px-4 py-2 rounded-full font-semibold hover:opacity-90 transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: MILESTONE ACHIEVEMENTS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Milestone Achievements</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-green-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">🏆</span>
                <h3 className="text-2xl font-bold text-[#171C4A]">Frontend Master</h3>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Completed:</div>
                <div className="space-y-1">
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    ✔ HTML
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    ✔ CSS
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    ✔ JavaScript
                  </span>
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    ✔ React
                  </span>
                </div>
              </div>
              <div className="text-center py-4 bg-green-50 rounded-2xl">
                <div className="text-5xl font-black text-green-600">✓ UNLOCKED</div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-yellow-300">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">🎯</span>
                <h3 className="text-2xl font-bold text-[#171C4A]">Full Stack Ready</h3>
              </div>
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Required:</div>
                <div className="space-y-1">
                  <span className="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    🔄 Node.js
                  </span>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    🔒 MongoDB
                  </span>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold mr-2 mb-2">
                    🔒 Docker
                  </span>
                </div>
              </div>
              <div className="text-center py-4 bg-yellow-50 rounded-2xl">
                <div className="text-sm font-bold text-yellow-700">42% COMPLETE</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-yellow-400 rounded-full w-[42%]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: PROJECT-BASED LEARNING PATH */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Project-Based Learning</h2>
          <div className="bg-white rounded-[32px] p-8 shadow-xl">
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.name}>
                  <div
                    className={`rounded-2xl p-4 border-2 ${getStatusColor(project.status)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getStatusIcon(project.status)}</span>
                        <div className="font-bold">{project.name}</div>
                      </div>
                      <button className="bg-[#F2DD85] text-[#171C4A] px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition">
                        {project.status === "completed" ? "Review" : "Start"}
                      </button>
                    </div>
                  </div>
                  {projects.indexOf(project) < projects.length - 1 && (
                    <div className="flex justify-center py-2">
                      <div className="text-2xl text-gray-400">↓</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10: CAREER READINESS PREDICTOR */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Career Readiness Predictor</h2>
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-[40px] p-10 text-white shadow-2xl">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Current Readiness */}
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2">Current Readiness</div>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="white"
                      strokeWidth="6"
                      strokeDasharray={`${(72 / 100) * 314} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-black">72%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="text-4xl">→</div>
              </div>

              {/* Predicted Readiness */}
              <div className="text-center">
                <div className="text-sm opacity-80 mb-2">Predicted Readiness (After Skills)</div>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#F2DD85"
                      strokeWidth="6"
                      strokeDasharray={`${(88 / 100) * 314} 314`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-black">88%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="text-2xl font-black">Potential Increase: +16%</div>
              <div className="text-white/80 mt-2">
                Master Docker, AWS, and CI/CD to boost your Full Stack Developer readiness
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: LEARNING RESOURCE HUB */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Learning Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { skill: "React", resources: ["📚 Documentation", "🎥 Video Course", "💻 Practice"] },
              { skill: "Node.js", resources: ["📚 API Docs", "🎥 Tutorials", "💻 Projects"] },
              { skill: "Docker", resources: ["📚 Guide", "🎥 Crash Course", "💻 Lab"] },
              { skill: "AWS", resources: ["📚 Docs", "🎥 Training", "💻 Sandbox"] },
              { skill: "MongoDB", resources: ["📚 Manual", "🎥 Course", "💻 Practice"] },
              { skill: "Express", resources: ["📚 Docs", "🎥 Series", "💻 Examples"] },
            ].map((item) => (
              <div key={item.skill} className="bg-white rounded-[32px] p-6 shadow-xl hover:shadow-2xl transition-shadow">
                <h3 className="text-xl font-bold text-[#171C4A] mb-4">{item.skill}</h3>
                <div className="space-y-2">
                  {item.resources.map((resource) => (
                    <button
                      key={resource}
                      className="w-full text-left px-4 py-2 bg-[#F8F6E8] hover:bg-[#F2DD85] rounded-lg font-semibold text-[#171C4A] transition"
                    >
                      {resource}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 12: ROADMAP ANALYTICS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Progress Analytics</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { category: "Frontend", progress: 90, icon: "🎨" },
              { category: "Backend", progress: 45, icon: "⚙️" },
              { category: "Database", progress: 35, icon: "🗄️" },
              { category: "Cloud", progress: 10, icon: "☁️" },
            ].map((item) => (
              <div key={item.category} className="bg-white rounded-[32px] p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{item.icon}</span>
                  <h3 className="font-bold text-[#171C4A]">{item.category}</h3>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">{item.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full transition-all ${
                        item.progress >= 80
                          ? "bg-green-500"
                          : item.progress >= 60
                            ? "bg-yellow-500"
                            : item.progress >= 40
                              ? "bg-orange-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 13: NEXT BEST ACTIONS */}
        <section className="mb-12">
          <h2 className="text-3xl font-black text-[#171C4A] mb-6">Next Best Actions</h2>
          <div className="space-y-4">
            {[
              { title: "Complete Node.js Fundamentals", priority: "High", time: "3 Days" },
              { title: "Build REST API Project", priority: "Medium", time: "4 Days" },
              { title: "Learn Docker Basics", priority: "High", time: "5 Days" },
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
                    <p className="text-gray-600 mb-4">⏱ Estimated time: {action.time}</p>
                    <div className="flex gap-3 items-center">
                      <button className="bg-[#F2DD85] text-[#171C4A] px-6 py-2 rounded-full font-bold hover:opacity-90 transition">
                        Start
                      </button>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          action.priority === "High"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {action.priority} PRIORITY
                      </span>
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
