import { createFileRoute } from "@tanstack/react-router";
import ResumeAnalysis from "@/routes/_public/ResumeAnalysis";

export const Route = createFileRoute("/_public/ResumeDetails")({ 
  component: ResumeDetails,
});

function ResumeDetails() {
  return (
    <ResumeAnalysis
      initialTab="details"
    />
  );
}


