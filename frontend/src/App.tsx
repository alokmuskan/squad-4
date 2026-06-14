import { useState, useEffect } from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Dashboard from "./pages/Dashboard";
import SkillGapDashboard from "./pages/SkillGapDashboard";
import RoadmapVisualization from "./pages/RoadmapVisualization";
import AuthCallback from "./pages/AuthCallback";
import GithubAnalysis from "./pages/GithubAnalysis";

type Page =
  | "home"
  | "login"
  | "dashboard"
  | "resumeUpload"
  | "resumeDetails"
  | "skillGapDashboard"
  | "roadmapVisualization"
  | "auth-callback"
  | "github-analysis"; 

export default function App() {
  const [page, setPage] = useState<Page>("home");

  // Check if returning from GitHub OAuth callback
  useEffect(() => {
  if (
  window.location.pathname === "/auth/callback/google" ||
  window.location.pathname === "/auth/callback/github"
) {
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
  onResume={() => setPage("resumeDetails")}
  onSkillGapDashboard={() => setPage("skillGapDashboard")}
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

  if (page === "resumeUpload" || page === "resumeDetails") {
    return (
      <ResumeAnalysis
        initialTab={page === "resumeDetails" ? "details" : "upload"}
        onLogin={() => setPage("login")}
        onDashboard={() => setPage("dashboard")}
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "dashboard") {
    return (
      <Dashboard
        onBack={() => setPage("home")}
        onResumeUpload={() => setPage("resumeUpload")}
        onResumeDetails={() => setPage("resumeDetails")}
        onSkillGapDashboard={() => setPage("skillGapDashboard")}
        onRoadmapVisualization={() => setPage("roadmapVisualization")}
          onGithubAnalysis={() => setPage("github-analysis")}
      />
    );
  }

  if (page === "skillGapDashboard") {
    return (
      <SkillGapDashboard
        onBack={() => setPage("dashboard")}
      />
    );
  }

  if (page === "roadmapVisualization") {
    return (
      <RoadmapVisualization
        onBack={() => setPage("dashboard")}
      />
    );
  }

  return (
    <Home
      onStart={() => setPage("resumeUpload")}
      onSignIn={() => setPage("login")}
    />
  );
}
