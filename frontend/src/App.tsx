import { useState, useEffect } from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Dashboard from "./pages/Dashboard";
import ResumeDetails from "./pages/ResumeDetails";
import SkillGapDashboard from "./pages/SkillGapDashboard"; 
import AuthCallback from "./pages/AuthCallback";
import GithubAnalysis from "./pages/GithubAnalysis";

type Page =
  | "home"
  | "resume"
  | "login"
  | "dashboard"
  | "ResumeDetails"
  | "SkillGapDashboard"
  | "auth-callback"
  | "github-analysis";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Check if returning from GitHub OAuth callback
  useEffect(() => {
    if (window.location.pathname === "/auth/callback") {
      setPage("auth-callback");
    }

    // Auto-login if user token exists in localStorage
    const token = localStorage.getItem("auth_token");
    if (token && window.location.pathname !== "/auth/callback") {
      setPage("dashboard");
    }
  }, []);

  if (page === "auth-callback") {
    return (
      <AuthCallback
        onLoginSuccess={(token, user) => {
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(user));
          window.history.replaceState({}, document.title, "/");
          setPage("dashboard");
        }}
        onLoginFailure={(error) => {
          alert("Login failed: " + error);
          window.history.replaceState({}, document.title, "/");
          setPage("login");
        }}
      />
    );
  }

  if (page === "github-analysis") {
    return (
      <GithubAnalysis
        onBack={() => setPage("dashboard")}
        onResume={() => setPage("ResumeDetails")}
        onSkillGapDashboard={() => setPage("SkillGapDashboard")}
      />
    );
  }

  if (page === "login") {
    return (
      <LoginPage
        onLogin={() => setPage("dashboard")}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "resume") {
    return (
      <ResumeAnalysis
        onLogin={() => setPage("login")}
        onDashboard={() => setPage("dashboard")}
        onBack={() => setPage("home")}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <Dashboard 
        onResume={() => setPage("ResumeDetails")} 
        onBack={() => setPage("home")}
        onSkillGapDashboard={() => setPage("SkillGapDashboard")} 
        onGithubAnalysis={() => setPage("github-analysis")}
      />
    );
  } 

  if (page === "SkillGapDashboard") { 
    return (
      <SkillGapDashboard
        onBack={() => setPage("dashboard")}
        onSkillGapDashboard={() => setPage("SkillGapDashboard")}
      />
    );
  }

  if (page === "ResumeDetails") {
    return (
      <ResumeDetails
        onBack={() => setPage("dashboard")}
      />
    );
  }

  return (
    <Home
      onStart={() => setPage("resume")}
      onSignIn={() => setPage("login")}
    />
  );
}
