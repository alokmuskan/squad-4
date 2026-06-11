interface DashboardNavbarProps {
  onResume: () => void;
  onBack: () => void; 
}
export default function DashboardNavbar({
  onResume,
  onBack,
}: DashboardNavbarProps)
{
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200">

      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* Logo */}
       <div className="flex items-center gap-4">

  <button
    onClick={onBack}
    className="px-5 py-3 bg-white shadow-lg rounded-2xl hover:scale-105 transition"
  >
    ← Home
  </button>

  <h1 className="text-5xl font-black text-[#171C4A]">
    LearnFlow.
  </h1>

</div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-gray-600 font-medium">

          <button className="hover:text-[#171C4A]">
            Dashboard
          </button>

          <button className="hover:text-[#171C4A]">
            AI Roadmap
          </button>

          <button onClick={onResume}>
  Resume
</button> 

          <button className="hover:text-[#171C4A]">
            GitHub
          </button>

          <button className="hover:text-[#171C4A]">
            Interviews
          </button>

          <button className="hover:text-[#171C4A]">
            Progress
          </button>

        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">

          <button className="relative text-2xl">
            🔔

            <span className="absolute top-1 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 bg-[#F8F6E8] px-4 py-2 rounded-full">

            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />

            <div>
              <p className="font-bold text-[#171C4A]">
                Alex
              </p>

              <p className="text-xs text-gray-500">
                Level 7 Learner
              </p>
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}
