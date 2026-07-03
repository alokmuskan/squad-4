import { useRef } from "react";
import type { UseFormRegister, UseFormSetValue, UseFormHandleSubmit, FormState, UseFormWatch } from "react-hook-form";
import { CAREER_GOALS } from "@/services/api";
import type { ResumeAnalysisForm } from "../schemas/resume-schema";

interface Props {
  register: UseFormRegister<ResumeAnalysisForm>;
  handleSubmit: UseFormHandleSubmit<ResumeAnalysisForm>;
  watch: UseFormWatch<ResumeAnalysisForm>;
  setValue: UseFormSetValue<ResumeAnalysisForm>;
  errors: FormState<ResumeAnalysisForm>["errors"];
  loading: boolean;
  gapLoading: boolean;
  analyzed: boolean;
  experienceLevel: string;
  onExperienceLevelChange: (v: string) => void;
  onAnalyze: (data: ResumeAnalysisForm) => void;
  onSkillGap: () => void;
  onClear: () => void;
}

export default function ResumeUploadForm({
  register,
  handleSubmit,
  watch,
  setValue,
  errors,
  loading,
  gapLoading,
  analyzed,
  experienceLevel,
  onExperienceLevelChange,
  onAnalyze,
  onSkillGap,
  onClear,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const file = watch("file");

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-[#171C4A]">Analyze Your Profile</h2>
      <p className="text-gray-500 mt-1 text-sm">Upload your resume and choose your target role</p>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-[#171C4A] mb-1">
          Career Goal
        </label>
        <select
          {...register("careerGoal")}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-sm"
        >
          {CAREER_GOALS.map((goal) => (
            <option key={goal} value={goal}>
              {goal}
            </option>
          ))}
        </select>
        {errors.careerGoal && (
          <p className="mt-1 text-xs text-red-600">{errors.careerGoal.message}</p>
        )}
      </div>

      <div className="mt-4">
        <label className="block text-xs font-semibold text-[#171C4A] mb-1">
          Experience Level <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <select
          value={experienceLevel}
          onChange={(e) => onExperienceLevelChange(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white text-sm"
        >
          <option value="">Auto-detect from resume</option>
          <option value="fresher">Fresher (0-1 yrs)</option>
          <option value="mid">Mid-Level (2-5 yrs)</option>
          <option value="senior">Senior (6+ yrs)</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">
          Affects skill weighting — freshers get boosted focus on fundamentals
        </p>
      </div>

      <div className="mt-6 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
        <input
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) {
              setValue("file", selected);
              onClear();
            }
          }}
        />

        <div className="text-4xl">📄</div>
        <h3 className="mt-2 text-lg font-bold">Upload Resume</h3>
        <p className="text-gray-500 mt-1 text-sm">PDF only • Max 10 MB</p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 px-6 py-2 rounded-full bg-[#171C4A] text-white font-semibold hover:opacity-90 text-sm"
        >
          Choose File
        </button>

        {file && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="text-green-700 font-medium text-sm">✓ {file.name}</p>
          </div>
        )}
        {errors.file && (
          <p className="mt-1 text-xs text-red-600">{errors.file.message}</p>
        )}
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit(onAnalyze)}
        className={`w-full mt-6 py-3 rounded-xl text-base font-bold transition ${
          !loading
            ? "bg-yellow-300 text-[#171C4A] hover:opacity-90"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? "Analyzing with AI..." : "Analyze My Resume →"}
      </button>

      {analyzed && (
        <button
          disabled={gapLoading}
          onClick={onSkillGap}
          className="w-full mt-3 py-3 rounded-xl text-base font-bold bg-[#171C4A] text-white hover:opacity-90 disabled:opacity-60"
        >
          {gapLoading ? "Running Skill Gap Analysis..." : "Run Skill Gap Analysis →"}
        </button>
      )}
    </div>
  );
}
