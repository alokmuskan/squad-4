import { useState } from "react";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Dashboard from "./pages/Dashboard";

type Page =
  | "home"
  | "resume"
  | "login"
  | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("home");

  if (page === "login") {
    return (
      <LoginPage
        onLogin={() => setPage("dashboard")}
      />
    );
  }

  if (page === "resume") {
    return (
      <ResumeAnalysis
        onLogin={() => setPage("login")}
        onDashboard={() => setPage("dashboard")}
      />
    );
  }

  if (page === "dashboard") {
    return <Dashboard />;
  }


  return (
    <Home
      onStart={() => setPage("resume")}
      onSignIn={() => setPage("login")}
    />
  );
}