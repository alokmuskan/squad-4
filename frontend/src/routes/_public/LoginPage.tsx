import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;

const REDIRECT_URI_GOOGLE =
  import.meta.env.VITE_REDIRECT_URI_GOOGLE ||
  "http://localhost:5173/auth/callback/google";

const REDIRECT_URI_GITHUB =
  import.meta.env.VITE_REDIRECT_URI_GITHUB ||
  "http://localhost:5173/auth/callback/github";

const GITHUB_OAUTH_STATE_KEY = "github_oauth_state";

function handleGoogleLogin() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI_GOOGLE,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function handleGitHubLogin() {
  const state = crypto.randomUUID();
  sessionStorage.setItem(GITHUB_OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI_GITHUB,
    response_type: "code",
    scope: "user:email read:user repo",
    state,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F6E8] p-4 md:p-6">
      <div className="h-[104vh] w-[94vw] mx-auto bg-white rounded-[32px] shadow-2xl grid lg:grid-cols-[0.9fr_1.1fr] overflow-hidden">
        {/* LEFT SIDE */}
        <div className="flex items-center justify-center px-6 py-10 md:px-14 relative overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-16 right-12 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute top-1/2 right-32 w-24 h-24 bg-pink-200 rounded-full blur-2xl opacity-30" />

          <button
            onClick={() => navigate({ to: "/" })}
            className="absolute top-8 left-8 text-gray-500 hover:text-[#171C4A] font-medium"
          >
            ← Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8 relative z-10"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src="https://cdni.iconscout.com/illustration/premium/thumb/team-working-on-project-3486349-2912024.png"
                alt="Learning Illustration"
                className="w-28 h-28 object-contain"
              />

              <h3 className="text-5xl font-black text-[#171C4A]">
                Welcome Back
              </h3>
            </div>

            <div className="mt-10 space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl bg-[#F9FAFB] border border-gray-200 px-5 py-4 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl bg-[#F9FAFB] border border-gray-200 px-5 py-4 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all"
              />

              <button
                type="button"
                onClick={() => {
                  if (!email || !password) {
                    setShowPopup(true);
                    return;
                  }

                  navigate({ to: "/dashboard" });
                }}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-all"
              >
                Sign In
              </button>
            </div>

            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 bg-white mb-3 hover:bg-gray-50 transition-colors"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            <button
              onClick={handleGitHubLogin}
              className="w-full border border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 transition-colors"
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
              <span className="font-semibold text-[#7C3AED] cursor-pointer">
                Sign Up
              </span>
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex relative items-center justify-center bg-gradient-to-br from-[#B784F7] via-[#9B6AF3] to-[#7C3AED] overflow-hidden">
          <div className="absolute top-10 left-10 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />

          <motion.img
            src="https://i.ibb.co/nsBTnZwG/Chat-GPT-Image-Jun-19-2026-08-19-05-PM.png"
            alt="Learning"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-[600px] max-w-none h-auto object-contain scale-125 relative z-10"
            style={{
              filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.22))",
            }}
          />
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[32px] p-8 w-[420px] text-center shadow-2xl">
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-3xl font-bold text-[#171C4A]">
                Sign In Required
              </h2>
              <p className="text-gray-500 mt-4">
                Please enter your email and password.
              </p>
              <p className="text-gray-500 mt-2">
                New to LearnFlow? Create an account to unlock:
              </p>
              <div className="mt-5 text-left space-y-2">
                <p>✨ More features and personalized learning paths!</p>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="mt-6 px-8 py-3 rounded-full bg-[#171C4A] text-white"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
