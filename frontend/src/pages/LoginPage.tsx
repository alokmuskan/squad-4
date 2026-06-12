
import { motion } from "framer-motion";
interface LoginPageProps {
  onLogin: () => void;
}
export default function LoginPage({ onLogin }: LoginPageProps) { 
  return (
    <div className="min-h-screen flex overflow-hidden bg-[#F8F6E8]">

      {/* LEFT SIDE */}
  
<div
  className="hidden lg:flex w-1/2 bg-cover bg-center items-center justify-center relative"
  style={{
    backgroundImage:
      "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')",
  }}
>
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-[#171C4A]/75" />

  {/* Content */}
  <div className="relative z-10 max-w-xl px-10 text-white">

    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-4xl font-black leading-tight"
    >
      Learn Smarter.
      Grow Faster.
    </motion.h1>

    <p className="mt-6 text-xl text-white/90">
      Upload your resume, analyze GitHub projects,
      identify skill gaps, and get personalized
      learning roadmaps powered by AI.
    </p>

    {/* Feature Cards */}
    <div className="mt-10 grid grid-cols-2 gap-5">

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/15 backdrop-blur-md p-5 rounded-3xl border border-white/20"
      >
        <div className="text-4xl">📄</div>

        <h3 className="mt-3 font-bold">
          Resume Analysis
        </h3>

        <p className="text-sm text-white/80 mt-2">
          Discover missing skills instantly.
        </p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/15 backdrop-blur-md p-5 rounded-3xl border border-white/20"
      >
        <div className="text-4xl">🐙</div>

        <h3 className="mt-3 font-bold">
          GitHub Insights
        </h3>

        <p className="text-sm text-white/80 mt-2">
          Analyze repositories and projects.
        </p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/15 backdrop-blur-md p-5 rounded-3xl border border-white/20"
      >
        <div className="text-4xl">🎯</div>

        <h3 className="mt-3 font-bold">
          Interview Prep
        </h3>

        <p className="text-sm text-white/80 mt-2">
          Practice with AI-generated interviews.
        </p>
      </motion.div>

      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/15 backdrop-blur-md p-5 rounded-3xl border border-white/20"
      >
        <div className="text-4xl">🧠</div>

        <h3 className="mt-3 font-bold">
          AI Roadmaps
        </h3>

        <p className="text-sm text-white/80 mt-2">
          Personalized learning journeys.
        </p>
      </motion.div>

    </div>

    {/* Stats Card */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20"
    >
      <div className="grid grid-cols-3 gap-4 text-center">

        <div>
          <h3 className="text-3xl font-black">85%</h3>
          <p className="text-white/70 text-sm">
            Skill Match
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-black">150+</h3>
          <p className="text-white/70 text-sm">
            Learning Paths
          </p>
        </div>

        <div>
          <h3 className="text-3xl font-black">AI</h3>
          <p className="text-white/70 text-sm">
            Powered
          </p>
        </div>

      </div>
    </motion.div>

  </div>
</div> 



{/* RIGHT SIDE */}
<div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">

  {/* Floating Icons */}
  <motion.div
    animate={{ y: [0, -15, 0] }}
    transition={{ duration: 4, repeat: Infinity }}
    className="absolute left-10 top-24 text-5xl"
  >
    📚
  </motion.div>

  <motion.div
    animate={{ y: [0, 15, 0] }}
    transition={{ duration: 5, repeat: Infinity }}
    className="absolute right-16 top-32 text-5xl"
  >
    
  </motion.div>

  <motion.div
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 3.5, repeat: Infinity }}
    className="absolute left-16 bottom-32 text-5xl"
  >
    
  </motion.div>

  <motion.div
    animate={{ y: [0, 12, 0] }}
    transition={{ duration: 4.5, repeat: Infinity }}
    className="absolute right-10 bottom-24 text-5xl"
  >
    🚀
  </motion.div>

  <motion.div
    animate={{ rotate: [0, 10, 0] }}
    transition={{ duration: 3, repeat: Infinity }}
    className="absolute right-32 top-20 text-4xl"
  >
    
  </motion.div>

  <motion.div
    animate={{ rotate: [0, -10, 0] }}
    transition={{ duration: 3, repeat: Infinity }}
    className="absolute left-32 bottom-20 text-4xl"
  >
    
  </motion.div>

  {/* Login Card */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className="w-full max-w-md bg-white rounded-[36px] shadow-2xl p-10 relative z-10"
  >
    <div className="text-center">

      <div className="flex justify-center gap-4 mb-6">

        <motion.img
          whileHover={{ y: -5 }}
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Student"
          className="w-14 h-14"
        />

        <motion.img
          whileHover={{ y: -5 }}
          src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png"
          alt="Developer"
          className="w-14 h-14"
        />

        <motion.img
          whileHover={{ y: -5 }}
          src="https://cdn-icons-png.flaticon.com/512/6997/6997662.png"
          alt="AI"
          className="w-14 h-14"
        />

      </div>

      <h2 className="text-5xl font-black text-[#171C4A]">
        Welcome Back
      </h2>

      <p className="mt-4 text-gray-500">
        Continue your AI-powered learning journey
      </p>
    </div>

    {/* Form */}
    <form className="mt-10 space-y-4">

      <input
        type="email"
        placeholder="Email Address"
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#171C4A]"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-[#171C4A]"
      />

      <button
        type="button"
        onClick={onLogin}
        className="w-full py-4 rounded-2xl bg-[#171C4A] text-white font-semibold text-lg hover:bg-[#0f1438]"
      >
        Sign In →
      </button>


    </form>

    {/* Divider */}
    <div className="flex items-center my-8">
      <div className="flex-1 h-px bg-gray-300"></div>
      <span className="px-4 text-gray-400">OR</span>
      <div className="flex-1 h-px bg-gray-300"></div>
    </div>

    {/* Google */}
    <button className="w-full border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 bg-white mb-3 hover:bg-gray-50">
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continue with Google
    </button>

    {/* GitHub */}
    <button 
      type="button"
      onClick={() => {
        const client_id = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
        const redirect_uri = "http://localhost:5173/auth/callback";
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=read:user,user:email`;
      }}
      className="w-full border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50"
    >
      <img
        src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
        alt="GitHub"
        className="w-5 h-5"
      />
      Continue with GitHub
    </button>

    <p className="text-center mt-8 text-gray-500">
      Don't have an account?{" "}
      <span className="font-semibold text-[#171C4A] cursor-pointer">
        Sign Up
      </span>
    </p>
  </motion.div>
</div>
    </div>
  );
}