import DashboardNavbar from "../components/DashboardNavbar";
interface DashboardProps {
  onResume: () => void;
  onBack: () => void;
  onSkillGapDashboard: () => void;
}

export default function Dashboard({
  onResume,
  onBack, 
  onSkillGapDashboard, 
}: DashboardProps)
 {
  return (  
      <div className="min-h-screen bg-[#F8F6E8]">

<div className="min-h-screen bg-[#F8F6E8]">
  <DashboardNavbar
   onResume={onResume}
   onBack={onBack}
    onSkillGapDashboard={onSkillGapDashboard}
  />

  <div className="max-w-7xl mx-auto px-6 py-5" > 
      {/* Header */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-4xl font-black text-[#171C4A]">
            Welcome Back 👋
          </h1>

          <p className="text-gray-500 mt-2">
            Continue your journey to becoming a Full Stack Developer
          </p>
        </div>

        <div className="bg-[#171C4A] text-white px-6 py-4 rounded-3xl">
          🔥 14 Day Streak
        </div>
  
      </div>

      {/* Level Card */}
      <div className="mt-8 bg-[#171C4A] rounded-[40px] p-10 text-white shadow-2xl">

        <div className="flex justify-between items-center">

          <div>
            <p className="text-white/70">
              Current Level
            </p>

            <h2 className="text-6xl font-black mt-2">
              Level 7
            </h2>

            <p className="text-2xl mt-3">
              Full Stack Explorer 🚀
            </p>
          </div>

          <div className="text-8xl">
            🏆
          </div>

        </div>

        <div className="mt-8">

          <div className="flex justify-between mb-2">
            <span>XP Progress</span>
            <span>780 / 1000 XP</span>
          </div>

          <div className="h-5 bg-white/20 rounded-full">
            <div className="h-5 w-[78%] bg-[#F2DD85] rounded-full"></div>
          </div>

        </div>

      </div>

      {/* Mission + AI Coach */}
      <div className="grid lg:grid-cols-2 gap-8 mt-10">

        <div className="bg-white rounded-[32px] p-8 shadow-xl">

          <h2 className="text-2xl font-bold text-[#171C4A]">
            🚀 Current Mission
          </h2>

          <div className="mt-6 bg-[#F8F6E8] rounded-3xl p-6">

            <h3 className="text-xl font-bold">
              Learn Docker Fundamentals
            </h3>

            <p className="text-gray-500 mt-2">
              Complete 3 lessons and 1 project
            </p>

            <button className="mt-5 bg-[#171C4A] text-white px-6 py-3 rounded-full">
              Continue Mission
            </button>

          </div>

        </div>

        <div className="bg-[#F2DD85] rounded-[32px] p-8 shadow-xl">

          <h2 className="text-2xl font-bold text-[#171C4A]">
            🤖 AI Career Coach
          </h2>

          <p className="mt-5 text-[#171C4A]">
            Based on your resume and GitHub profile,
            focus on Docker and AWS to increase
            your employability score by 18%.
          </p>

        </div>

      </div>

      {/* Roadmap */}
      <div className="mt-10 bg-white rounded-[32px] p-8 shadow-xl">

        <h2 className="text-3xl font-bold text-[#171C4A]">
          🗺️ Your AI Roadmap
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">

          <div className="bg-green-100 px-6 py-4 rounded-2xl">
            ✅ React
          </div>

          <div className="text-2xl">➡️</div>

          <div className="bg-green-100 px-6 py-4 rounded-2xl">
            ✅ Node.js
          </div>

          <div className="text-2xl">➡️</div>

          <div className="bg-yellow-100 px-6 py-4 rounded-2xl">
            🔄 SQL
          </div>

          <div className="text-2xl">➡️</div>

          <div className="bg-gray-100 px-6 py-4 rounded-2xl">
            🔒 Docker
          </div>

          <div className="text-2xl">➡️</div>

          <div className="bg-gray-100 px-6 py-4 rounded-2xl">
            🔒 AWS
          </div>

        </div>

      </div>

      {/* Skills Radar Style */}
      <div className="grid lg:grid-cols-3 gap-8 mt-10">

        <div className="bg-white rounded-[32px] p-8 shadow-xl">

          <h3 className="font-bold text-xl text-[#171C4A]">
            📄 Resume Score
          </h3>

          <div className="text-6xl font-black mt-6 text-[#171C4A]">
            91%
          </div>

        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-xl">

          <h3 className="font-bold text-xl text-[#171C4A]">
            🐙 GitHub Score
          </h3>

          <div className="text-6xl font-black mt-6 text-[#171C4A]">
            84%
          </div>

        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-xl">

          <h3 className="font-bold text-xl text-[#171C4A]">
            🎯 Interview Ready
          </h3>

          <div className="text-6xl font-black mt-6 text-[#171C4A]">
            88%
          </div>

        </div>

      </div>

      {/* Achievements */}
      <div className="mt-10 bg-white rounded-[32px] p-8 shadow-xl">

        <h2 className="text-3xl font-bold text-[#171C4A]">
          🏅 Achievements
        </h2>

        <div className="grid md:grid-cols-4 gap-6 mt-8">

          <div className="bg-[#F8F6E8] p-6 rounded-3xl text-center">
            🔥
            <p className="mt-3 font-bold">
              14 Day Streak
            </p>
          </div>

          <div className="bg-[#F8F6E8] p-6 rounded-3xl text-center">
            📄
            <p className="mt-3 font-bold">
              Resume Uploaded
            </p>
          </div>

          <div className="bg-[#F8F6E8] p-6 rounded-3xl text-center">
            🧠
            <p className="mt-3 font-bold">
              AI Explorer
            </p>
          </div>

          <div className="bg-[#F8F6E8] p-6 rounded-3xl text-center">
            🚀
            <p className="mt-3 font-bold">
              Roadmap Started
            </p>
          </div>

        </div>

      </div>
</div> 
    </div>
    </div> 
  );
}
