import { createFileRoute } from "@tanstack/react-router";
import ResumeAnalysis from "@/routes/_public/ResumeAnalysis";

export const Route = createFileRoute("/resume-analysis")({
  component: ResumeAnalysis,
});

