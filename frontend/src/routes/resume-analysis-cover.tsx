import { createFileRoute } from "@tanstack/react-router";
import ResumeAnalysisCover from "@/routes/_public/ResumeAnalysisCover";

export const Route = createFileRoute("/resume-analysis-cover")({
  component: ResumeAnalysisCover,
});

