import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Clean, production-safe backend URL setup
  const BACKEND_URL = "https://learnflow-omega-ten.vercel.app";

  // Full-window redirection for Google Sign-in to completely bypass CORS preflight blocks
  const handleGoogleLogin = () => {
    const callbackUrl = encodeURIComponent(window.location.origin + "/dashboard");
    window.location.href = `${BACKEND_URL}/api/auth/sign-in/social?provider=google&callbackURL=${callbackUrl}`;
  };

  // Full-window redirection for GitHub Sign-in
  const handleGitHubLogin = () => {
    const callbackUrl = encodeURIComponent(window.location.origin + "/dashboard");
    window.location.href = `${BACKEND_URL}/api/auth/sign-in/social?provider=github&callbackURL=${callbackUrl}`;
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#F8F6E8]">
      {/* LEFT SIDE */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center items-center justify-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-[#171C4A]/75" />
        <div className="relative z-10 max-w-xl px-10 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black leading-tight"
          >
            Learn Smarter. Grow Faster.
          </motion.h1>
          <p className="mt-6 text-xl text-white/90">
            Upload your resume, analyze GitHub projects, identify skill gaps, and get personalized
            learning roadmaps powered by AI.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-5">
            {[
              { icon: "📄", title: "Resume Analysis", desc: "Discover missing skills instantly." },
              { icon: "🐙", title: "GitHub Insights", desc: "Analyze repositories and projects." },
              { icon: "🎯", title: "Interview Prep", desc: "Practice with AI-generated interviews." },
              { icon: "🧠", title: "AI Roadmaps", desc: "Personalized learning journeys." },
            ].map((card) => (
              <motion.div
                key={card.title}
                whileHover={{ y: -5 }}
                className="bg-white/15 backdrop-blur-md p-5 rounded-3xl border border-white/20"
              >
                <div className="text-4xl">{card.icon}</div>
                <h3 className="mt-3 font-bold">{card.title}</h3>
                <p className="text-sm text-white/80 mt-2">{card.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="text-3xl font-black">85%</h3>
                <p className="text-white/70 text-sm">Skill Match</p>
              </div>
              <div>
                <h3 className="text-3xl font-black">9+</h3>
                <p className="text-white/70 text-sm">Career Paths</p>
              </div>
              <div>
                <h3 className="text-3xl font-black">AI</h3>
                <p className="text-white/70 text-sm">Powered</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-10 top-24 text-5xl"
        >
          📚
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity }}
          className="absolute right-10 bottom-24 text-5xl"
        >
          🚀
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md bg-white rounded-[36px] shadow-2xl p-10 relative z-10"
        >
          <div className="text-center">
            <h2 className="text-5xl font-black text-[#171C4A]">Welcome Back</h2>
            <p className="mt-4 text-gray-500">Continue your AI-powered learning journey</p>
          </div>

          <div className="mt-8 space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#171C4A]/20 focus:border-[#171C4A]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="type"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#171C4A]/20 focus:border-[#171C4A]"
              />
            </div>

            {/* OR Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-sm text-gray-400 font-medium">OR</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 transition font-semibold"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="w-full border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 transition font-semibold"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
                alt="GitHub"
                className="w-5 h-5"
              />
              Continue with GitHub
            </button>
          </div>
          <p className="text-center mt-8 text-gray-500 text-sm">
            By signing in, you agree to our terms. Your data is used only to provide LearnFlow
            features.
          </p>
        </motion.div>
      </div>
    </div>
  );
}