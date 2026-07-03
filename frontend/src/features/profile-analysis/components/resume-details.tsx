import { useNavigate } from "@tanstack/react-router";

interface ResumeDetailsProps {
  onBack?: () => void;
}

export default function ResumeDetails({ onBack }: ResumeDetailsProps) {
  const navigate = useNavigate();

  const raw = localStorage.getItem("learnflow_resume_data");
  const resumeData = raw ? JSON.parse(raw) : null;
  const careerGoal = localStorage.getItem("learnflow_career_goal") || "your target role";

  const handleBack = () => {
    if (onBack) onBack();
    else navigate({ to: "/dashboard" });
  };

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] flex items-center justify-center px-6">
        <div className="bg-white rounded-[32px] p-10 shadow-xl text-center max-w-md">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-2xl font-bold text-[#171C4A] mb-2">No Resume Analyzed Yet</h3>
          <p className="text-gray-500 mb-6">Upload and analyze your resume first.</p>
          <button
            onClick={() => navigate({ to: "/resume" })}
            className="px-8 py-3 bg-[#171C4A] text-white rounded-2xl font-bold"
          >
            Go to Resume Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6E8] p-8">
      <button onClick={handleBack} className="mb-6 px-4 py-2 bg-white rounded-xl shadow">
        ← Dashboard
      </button>

      <div className="bg-gradient-to-r from-[#171C4A] to-[#2E3678] rounded-[40px] p-8 text-white shadow-2xl">
        <p className="text-white/60">AI Resume Intelligence</p>
        <h1 className="text-4xl font-black mt-1">Your Career Snapshot</h1>
        <p className="mt-4 text-white/80 max-w-2xl">
          We analyzed your resume and identified strengths, missing skills, ATS improvements, and
          career growth opportunities for <strong>{careerGoal}</strong>.
        </p>
      </div>

      <div className="mt-8 bg-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-[#171C4A]">Resume Overview</h2>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Target Role</p>
            <h3 className="font-bold">{careerGoal}</h3>
          </div>
          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Experience</p>
            <h3 className="font-bold">{resumeData.experience?.length ?? 0} role(s)</h3>
          </div>
          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Skills Found</p>
            <h3 className="font-bold">{resumeData.skills?.length ?? 0}</h3>
          </div>
          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Resume Score</p>
            <h3 className="font-bold">{resumeData.resumeScore ?? "—"}%</h3>
          </div>
        </div>
      </div>

      {resumeData.strengths?.length > 0 && (
        <div className="mt-8 bg-green-100 rounded-3xl p-8">
          <h2 className="text-2xl font-bold">✓ Strengths</h2>
          <ul className="mt-4 space-y-2">
            {resumeData.strengths.map((s: string) => (
              <li key={s} className="text-green-800">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resumeData.improvements?.length > 0 && (
        <div className="mt-8 bg-yellow-100 rounded-3xl p-8">
          <h2 className="text-2xl font-bold">⚠ Areas to Improve</h2>
          <ul className="mt-4 space-y-2">
            {resumeData.improvements.map((s: string) => (
              <li key={s} className="text-yellow-800">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resumeData.skills?.length > 0 && (
        <div className="mt-8 bg-white rounded-3xl p-8 shadow-xl">
          <h3 className="font-bold text-lg text-[#171C4A]">Extracted Skills</h3>
          <div className="flex flex-wrap gap-2 mt-4">
            {resumeData.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-1 bg-[#F8F6E8] text-[#171C4A] rounded-full font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
