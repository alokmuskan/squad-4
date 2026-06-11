import { useState } from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Dashboard from "./pages/Dashboard";
import ResumeDetails from "./pages/ResumeDetails";
import SkillGapDashboard from "./pages/SkillGapDashboard"; 

type Page =
  | "home"
  | "resume"
  | "login"
  | "dashboard"
  | "ResumeDetails"
  | "SkillGapDashboard";

export default function App() {
  const [page, setPage] = useState<Page>("home");




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

