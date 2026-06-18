import { useState, useEffect } from "react";

interface DashboardProps {
  onBack: () => void;
  onSkillGapDashboard?: () => void;
  onRoadmapVisualization?: () => void;
  onResumeUpload: () => void;
  onResumeDetails: () => void;
  onGithubAnalysis: () => void; 
   onRoadmapGenerator: () => void;
   onLearningTimeline: () => void; 
}

const roadmapItems = [
  { skill: "HTML / CSS", status: "Completed",  progress: 100 },
  { skill: "JavaScript", status: "Completed",  progress: 100 },
  { skill: "React",      status: "Completed",  progress: 100 },
  { skill: "Node.js",    status: "In Progress", progress: 60 },
  { skill: "Docker",     status: "Upcoming",   progress: 0  },
];

const mentors = [
  { name: "Priya Sharma", role: "Full Stack Dev",  courses: 18, followers: "1.2K" },
  { name: "Arjun Mehta",  role: "ML Engineer",     courses: 24, followers: "900"  },
  { name: "Sneha Rao",    role: "Data Scientist",   courses: 31, followers: "2.1K" },
  { name: "Kiran Reddy",  role: "DevOps Expert",    courses: 14, followers: "780"  },
];

const coursesInProgress = [
  { title: "React Advanced",  desc: "Hooks, context, performance patterns", progress: 72, color: "#EEE8FF", accent: "#7C5CFC", date: "Dec 15, 2024" },
  { title: "Node.js APIs",    desc: "REST, auth, DB integration",           progress: 45, color: "#FFF0E8", accent: "#F97316", date: "Jan 10, 2025" },
  { title: "Docker & CI/CD",  desc: "Containers, pipelines, deployment",    progress: 18, color: "#E8F5FF", accent: "#3B82F6", date: "Feb 20, 2025" },
];

const popularCategories = [
  { name: "AI / ML",      count: "42 Topics",  icon: "🤖" },
  { name: "Web Dev",      count: "126 Topics", icon: "🌐" },
  { name: "DevOps",       count: "58 Topics",  icon: "⚙️" },
  { name: "Data Science", count: "89 Topics",  icon: "📊" },
];

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div style={{ width: `${value}%`, background: color }} className="h-full rounded-full transition-all duration-500" />
    </div>
  );
}

export default function Dashboard({
  onBack,
  onSkillGapDashboard,
  onRoadmapVisualization,
  onResumeUpload,
  onResumeDetails,
  onGithubAnalysis,
  onRoadmapGenerator,
  onLearningTimeline, 
}: DashboardProps) {
  const [search, setSearch] = useState("");
  const [resumeOpen, setResumeOpen] = useState(false);
const [roadmapOpen, setRoadmapOpen] = useState(false);

const [user, setUser] = useState<any>(null);
const [showProfile, setShowProfile] = useState(false);

useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);



  return (

    <>

    <div className="min-h-screen bg-[#F4EFD8] p-4 md:p-6 font-sans">
      <div className="bg-white rounded-[36px] shadow-2xl overflow-hidden flex min-h-[95vh]">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-[230px] shrink-0 bg-[#FAFAFA] border-r border-gray-100 flex flex-col p-7 gap-8">

          <h1 className="text-2xl font-black text-[#171C4A] tracking-tight">Career Intel.</h1>

          <nav className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2 px-2">Main Menu</p>

            {/* Dashboard */}
            <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold bg-[#171C4A] text-white shadow-md">
              <span className="text-base">🏠</span> Dashboard
            </button>

            {/* ── Resume Analysis with expandable toggle ── */}
            <div>
              <button
                onClick={() => setResumeOpen((o) => !o)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#171C4A] transition-all"
              >
                <span className="text-base">📄</span>
                <span className="flex-1">Resume Analysis</span>
                {/* chevron that rotates when open */}
                <span
                  style={{
                    display: "inline-block",
                    transition: "transform .25s ease",
                    transform: resumeOpen ? "rotate(180deg)" : "rotate(0deg)",
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  ▾
                </span>
              </button>

              {/* sub-options — slide down when open */}
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: resumeOpen ? 120 : 0,
                  transition: "max-height .3s ease",
                }}
              >
                <div className="flex flex-col gap-1 pl-4 pt-1 pb-1">
                  <button
                    onClick={onResumeUpload}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#EEE8FF] hover:text-[#7C3AED] transition-all"
                  >
                    <span>📤</span> Upload &amp; Analyse
                  </button>
                  <button
                    onClick={onResumeDetails}
                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#EEE8FF] hover:text-[#7C3AED] transition-all"
                  >
                    <span>📊</span> Detailed Results
                  </button>
                </div>
              </div>
            </div>

            {/* Skill Gap */}
            <button
              onClick={onSkillGapDashboard}
              className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#171C4A] transition-all"
            >
              <span className="text-base">📈</span> Skill Gap
            </button>



            <button
  onClick={onRoadmapGenerator}
  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#171C4A] transition-all"
>
  <span className="text-base">🤖</span>
  AI Roadmap Generator
</button>



            {/* Roadmap */}
            <div>
  <button
    onClick={() => setRoadmapOpen((o) => !o)}
    className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#171C4A] transition-all"
  >
    <span className="text-base">🗺️</span>

    <span className="flex-1">Roadmap</span>

    <span
      style={{
        display: "inline-block",
        transition: "transform .25s ease",
        transform: roadmapOpen ? "rotate(180deg)" : "rotate(0deg)",
        fontSize: 12,
        color: "#9CA3AF",
      }}
    >
      ▾
    </span>
  </button>

  <div
    style={{
      overflow: "hidden",
      maxHeight: roadmapOpen ? 300 : 0,
      transition: "max-height .3s ease",
    }}
  >
    <div className="flex flex-col gap-1 pl-4 pt-1 pb-1">



      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#FFF7D6] hover:text-[#171C4A]">
        🎯 Milestones
      </button>

      <button   onClick={onLearningTimeline}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#FFF7D6] hover:text-[#171C4A]">
       
        📅 Learning Timeline
      </button>


      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#FFF7D6] hover:text-[#171C4A]">
        📚 Resource Retrieval (RAG). 
      </button>

      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#FFF7D6] hover:text-[#171C4A]">
        🎓 Courses
      </button>

      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#FFF7D6] hover:text-[#171C4A]">
        💻 Projects
      </button>

      <button
        onClick={onRoadmapVisualization}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#FFF7D6] hover:text-[#171C4A]"
      >
        🗺️ Visualization
      </button>

    </div>
  </div>
</div>




            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mt-6 mb-2 px-2">Settings</p>



            {[
              {
  label: "Profile",
  icon: "👤",
  onClick: () => setShowProfile(true),
},
              { label: "Settings", icon: "⚙️" },
              { label: "Logout",   icon: "🚪", onClick: onBack },
            ].map(({ label, icon, onClick }: any) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 hover:text-[#171C4A] transition-all"
              >
                <span className="text-base">{icon}</span> {label}
              </button>
            ))}
          </nav>

          {/* Subscription nudge */}
          <div className="mt-auto bg-[#FFF9E8] rounded-2xl p-4 border border-yellow-100">
            <div className="text-3xl mb-2">🐷</div>
            <p className="text-xs font-bold text-[#171C4A] leading-snug mb-3">5 days left on your plan</p>
            <button className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold py-2 rounded-xl transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TOP BAR */}
          <div className="flex justify-between items-center">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-5 py-3 bg-[#F7F7F7] rounded-full text-sm outline-none w-72 border border-transparent focus:border-gray-200 transition"
              />
            </div>



           <div className="flex items-center gap-3">
  <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-base hover:bg-gray-200 transition">
    🔔
  </button>

  <button onClick={() => setShowProfile(true)}>
    {user?.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-[#171C4A] text-white flex items-center justify-center font-bold text-sm">
        {user?.fullName?.charAt(0) || "U"}
      </div>
    )}
  </button>
</div>


          </div>













          {/* COURSES IN PROGRESS */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#171C4A]">Courses in Progress</h2>
              <button onClick={onRoadmapVisualization} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {coursesInProgress.map((c) => (
                <div key={c.title} style={{ background: c.color }} className="rounded-[24px] p-5 flex flex-col gap-3">
                  <p className="text-[11px] text-gray-400 font-medium">Start: {c.date}</p>
                  <div>
                    <h3 style={{ color: c.accent }} className="font-bold text-base">{c.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
                  </div>
                  <div>
                    <ProgressBar value={c.progress} color={c.accent} />
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-gray-400 font-medium">Progress</span>
                      <span className="text-[11px] font-bold text-[#171C4A]">{c.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STAT CARDS */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Resume Score", value: "91%", bg: "#F4EEFF", emoji: "📄" },
              { label: "ATS Score",    value: "87%", bg: "#FFF2E8", emoji: "🎯" },
              { label: "GitHub Score", value: "84%", bg: "#EAF8FF", emoji: "🐙" },
              { label: "Interview",    value: "88%", bg: "#FFF5D4", emoji: "💬" },
            ].map(({ label, value, bg, emoji }) => (
              <div key={label} style={{ background: bg }} className="rounded-[22px] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{emoji}</span>
                  <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
                <p className="text-3xl font-black text-[#171C4A]">{value}</p>
              </div>
            ))}
          </div>

          {/* CATEGORIES + MENTORS */}
          <div className="grid grid-cols-[220px_1fr] gap-4">
            <div className="bg-[#F9F9F9] rounded-[24px] p-5">
              <h2 className="font-bold text-base text-[#171C4A] mb-4">Popular Categories</h2>
              <div className="flex flex-col gap-3">
                {popularCategories.map(({ name, count, icon }) => (
                  <div key={name} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-[#171C4A]">{name}</p>
                      <p className="text-[11px] text-gray-400">{count}</p>
                    </div>
                    <span className="text-xl">{icon}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#F0F7FF] rounded-[24px] p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-base text-[#171C4A]">Top Mentors</h2>
                <button className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
              </div>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[1fr_120px_80px_100px_80px] text-[11px] text-gray-400 font-semibold px-2">
                  <span>Mentor</span><span>Speciality</span><span>Courses</span><span>Followers</span><span></span>
                </div>
                {mentors.map(({ name, role, courses, followers }) => (
                  <div key={name} className="grid grid-cols-[1fr_120px_80px_100px_80px] items-center bg-white rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#171C4A] text-white flex items-center justify-center text-sm font-bold">{name.charAt(0)}</div>
                      <span className="text-sm font-semibold text-[#171C4A]">{name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{role}</span>
                    <span className="text-xs text-gray-500">{courses} Courses</span>
                    <span className="text-xs text-gray-500">{followers} Followers</span>
                    <button className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-[11px] font-bold px-4 py-1.5 rounded-xl transition">Follow</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROADMAP TABLE */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#171C4A]">Learning Roadmap</h2>
              <button onClick={onRoadmapVisualization} className="text-sm text-blue-600 font-semibold hover:underline">View All</button>
            </div>
            <div className="bg-white border border-gray-100 rounded-[24px] overflow-hidden">
              {roadmapItems.map(({ skill, status, progress }, idx) => {
                const isCompleted = status === "Completed";
                const isProgress  = status === "In Progress";
                const rowBg       = isCompleted ? "#F0FDF4" : isProgress ? "#FFFBEB" : "#F9FAFB";
                const statusColor = isCompleted ? "text-green-600 bg-green-100" : isProgress ? "text-yellow-600 bg-yellow-100" : "text-gray-500 bg-gray-100";
                const barColor    = isCompleted ? "#22C55E" : isProgress ? "#F59E0B" : "#D1D5DB";
                return (
                  <div
                    key={skill}
                    style={{ background: rowBg }}
                    className={`grid grid-cols-[1fr_140px_200px] items-center gap-4 px-6 py-4 ${idx !== roadmapItems.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <span className="text-sm font-semibold text-[#171C4A]">{skill}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full w-fit ${statusColor}`}>{status}</span>
                    <div className="flex items-center gap-3">
                      <ProgressBar value={progress} color={barColor} />
                      <span className="text-xs font-bold text-[#171C4A] w-8 text-right">{progress}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      </div>
    </div>

{showProfile && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl p-8 w-[420px] shadow-2xl relative">

      <button
        onClick={() => setShowProfile(false)}
        className="absolute top-4 right-4 text-gray-500 text-xl hover:text-black"
      >
        ✕
      </button>

      <div className="flex flex-col items-center">

        <img
          src={
            user?.avatarUrl ||
            "https://ui-avatars.com/api/?name=User"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-[#171C4A]"
        />

        <h2 className="text-2xl font-bold mt-4 text-[#171C4A]">
          {user?.fullName || "User"}
        </h2>

        <p className="text-gray-500 mt-1">
          {user?.email || "No Email"}
        </p>

        <div className="w-full mt-6 space-y-3">

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Username</p>
            <p className="font-semibold">
              {user?.username || "Not Available"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Full Name</p>
            <p className="font-semibold">
              {user?.fullName || "Not Available"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400">Email Address</p>
            <p className="font-semibold break-all">
              {user?.email || "Not Available"}
            </p>
          </div>

        </div>
      </div>
    </div>
  </div>
)}
</>

  );
}


