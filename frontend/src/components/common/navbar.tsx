import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/authentication/hooks/use-auth";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <header className="flex justify-between items-center px-12 py-5">
      <Link to="/" className="font-black text-3xl text-[#171C4A]">
        LearnFlow.
      </Link>

      <nav className="hidden md:flex gap-12 text-gray-500 font-medium">
        <span>AI Learning</span>
        <span>Progress Tracker</span>
        <span>Resume + GitHub</span>
        <span>Roadmap</span>
      </nav>

      <button
        onClick={() => navigate({ to: isAuthenticated ? "/dashboard" : "/login" })}
        className="bg-[#F2DD85] text-[#171C4A] px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
      >
        {isAuthenticated ? "Dashboard" : "Sign In"}
      </button>
    </header>
  );
}
