import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  analyzeResume,
  analyzeSkillGap,
  getAuthToken,
  type CareerGoal,
} from "@/services/api";
import {
  resumeAnalysisSchema,
  type ResumeAnalysisForm,
} from "@/features/profile-analysis/schemas/resume-schema";
import ResumeUploadForm from "./ResumeUploadForm";
import ResumeMetricCards from "./ResumeMetricCards";
import ResumeSummary from "./ResumeSummary";
import ResumeSkillsList from "./ResumeSkillsList";
import ResumeFeedbackList from "./ResumeFeedbackList";
import ResumeExperienceTimeline from "./ResumeExperienceTimeline";
import type { ResumeData } from "@/features/profile-analysis/types/resume-types";

function sanitizeExperience(
  exp: { role?: string | null; company?: string | null; duration?: string | null }[],
): { role: string; company: string; duration: string }[] {
  return exp.filter((e) => e.role && e.company && e.duration) as { role: string; company: string; duration: string }[];
}

function sanitizeEducation(
  edu: { degree?: string | null; school?: string | null; year?: string | null }[],
): { degree: string; school: string; year: string }[] {
  return edu.filter((e) => e.degree && e.school && e.year) as { degree: string; school: string; year: string }[];
}

interface Props {
  onLogin?: () => void;
  onDashboard?: () => void;
  onSkillGapDashboard?: () => void;
}

type Tab = "overview" | "skills" | "improvement";

const TAB_LABELS: Record<Tab, string> = {
  overview: "Overview",
  skills: "Skills & Background",
  improvement: "Improvement",
};

export default function ResumeAnalysis({
  onLogin,
  onDashboard,
  onSkillGapDashboard,
}: Props) {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [gapLoading, setGapLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResumeAnalysisForm>({
    resolver: zodResolver(resumeAnalysisSchema),
    defaultValues: { careerGoal: "Full-Stack Developer" },
  });

  const careerGoal = watch("careerGoal") as CareerGoal;
  const [experienceLevel, setExperienceLevel] = useState<
    "fresher" | "mid" | "senior" | ""
  >("");

  const handleAnalyze = async (data: ResumeAnalysisForm) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await analyzeResume(
        data.file,
        data.careerGoal as CareerGoal,
      );
      setResumeData(result);
      localStorage.setItem("learnflow_resume_data", JSON.stringify(result));
      localStorage.setItem("learnflow_career_goal", data.careerGoal);
      setSuccess(true);
      setActiveTab("overview");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze resume",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkillGapAnalysis = async () => {
    if (!resumeData) return;

    const token = getAuthToken();
    if (!token) {
      if (onLogin) onLogin();
      else navigate({ to: "/login" });
      return;
    }

    setGapLoading(true);
    setError("");

    try {
      const inferredLevel = experienceLevel || undefined;
      const result = await analyzeSkillGap(
        resumeData.skills,
        careerGoal,
        sanitizeExperience(resumeData.experience),
        sanitizeEducation(resumeData.education),
        inferredLevel,
      );
      localStorage.setItem("learnflow_skill_gap", JSON.stringify(result));
      if (onSkillGapDashboard) onSkillGapDashboard();
      else navigate({ to: "/skill-gap" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to run skill gap analysis",
      );
    } finally {
      setGapLoading(false);
    }
  };

  const analyzed = !!resumeData;
  const careerFitScore =
    resumeData?.careerFit?.score ?? resumeData?.resumeScore ?? null;

  return (
    <section className="min-h-screen bg-[#F8F6E8] px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => {
            if (onDashboard) onDashboard();
            else navigate({ to: "/dashboard" });
          }}
          className="mb-4 px-3 py-2 bg-white rounded-xl shadow flex items-center gap-2 hover:bg-gray-50 transition text-sm"
        >
          <ArrowLeft size={16} />
          <span className="font-semibold">Dashboard</span>
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#171C4A]">
            Resume & Career Analysis
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Upload your resume, select a career goal, and get AI-powered resume
            scoring, ATS tips, and skill gap insights.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
            <span>✓</span>
            <span>
              Analysis complete! {resumeData?.skills.length} skills extracted
              {careerFitScore !== null ? ` • Career fit: ${careerFitScore}%` : ""}
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <ResumeUploadForm
            register={register}
            handleSubmit={handleSubmit}
            watch={watch}
            setValue={setValue}
            errors={errors}
            loading={loading}
            gapLoading={gapLoading}
            analyzed={analyzed}
            experienceLevel={experienceLevel}
            onExperienceLevelChange={(v) => setExperienceLevel(v as typeof experienceLevel)}
            onAnalyze={handleAnalyze}
            onSkillGap={handleSkillGapAnalysis}
            onClear={() => {
              setResumeData(null);
              setSuccess(false);
            }}
          />

          <div className="bg-[#171C4A] rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-xl font-bold">
              {analyzed ? "Resume Analysis Results" : "AI Analysis Preview"}
            </h2>
            <p className="mt-1 text-white/70 text-sm">
              {analyzed
                ? `Analysis for ${careerGoal}`
                : "Upload a resume to see AI-extracted insights"}
            </p>

            {analyzed ? (
              <>
                <div className="mt-6">
                  <ResumeMetricCards
                    skillCount={resumeData.skills.length}
                    careerFitScore={careerFitScore}
                    resumeScore={resumeData.resumeScore ?? null}
                    experienceCount={resumeData.experience.length}
                    analyzed={analyzed}
                  />
                </div>

                <div className="mt-6 border-b border-white/10">
                  <div className="flex gap-4">
                    {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 text-xs font-semibold transition border-b-2 ${
                          activeTab === tab
                            ? "text-yellow-300 border-yellow-300"
                            : "text-white/50 border-transparent hover:text-white/70"
                        }`}
                      >
                        {TAB_LABELS[tab]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  {activeTab === "overview" && (
                    <ResumeSummary
                      summary={resumeData.summary}
                      careerFitSummary={resumeData.careerFit?.summary}
                    />
                  )}

                  {activeTab === "skills" && (
                    <>
                      <ResumeSkillsList
                        skills={resumeData.skills}
                        softSkills={resumeData.softSkills}
                      />
                      <ResumeExperienceTimeline
                        experience={resumeData.experience}
                        education={resumeData.education}
                      />
                    </>
                  )}

                  {activeTab === "improvement" && (
                    <ResumeFeedbackList
                      strengths={resumeData.strengths}
                      improvements={resumeData.improvements}
                      atsTips={resumeData.atsTips}
                    />
                  )}
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={handleSkillGapAnalysis}
                    disabled={gapLoading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-yellow-300 text-[#171C4A] hover:opacity-90 disabled:opacity-60 transition"
                  >
                    {gapLoading
                      ? "Running..."
                      : "Run Skill Gap Analysis →"}
                  </button>
                  <button
                    onClick={() => {
                      if (onSkillGapDashboard) onSkillGapDashboard();
                      else navigate({ to: "/skill-gap" });
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    View Dashboard
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-6 text-white/50 text-sm text-center py-12">
                Complete the form on the left and click "Analyze My Resume" to
                see insights here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
