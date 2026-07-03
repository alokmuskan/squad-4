import { useState } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { submitAssessment } from "@/services/api";

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface AssessmentLocationState {
  assessmentId: string;
  questions: Question[];
  careerGoal: string;
}

function AssessmentQuiz({
  assessmentId,
  questions,
  careerGoal,
}: AssessmentLocationState) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    suggestions: string;
  } | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const unanswered = answers.some((a) => !a);
    if (unanswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await submitAssessment(assessmentId, answers);
      setResult(data);
      localStorage.setItem("learnflow_assessment_result", JSON.stringify(data));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to submit assessment";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-[#F8F6E8] px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[40px] p-10 shadow-2xl text-center">
            <div className="text-7xl mb-4">{result.score >= 80 ? "🏆" : "📚"}</div>
            <h1 className="text-4xl font-black text-[#171C4A]">Assessment Complete</h1>
            <p className="text-gray-500 mt-2">{careerGoal} Skill Assessment</p>

            <div className="mt-8 bg-[#171C4A] text-white rounded-3xl p-8">
              <div className="text-6xl font-black">{result.score}%</div>
              <p className="text-white/70 mt-2">
                {result.correctCount} of {result.totalQuestions} correct
              </p>
            </div>

            <p className="mt-8 text-gray-600 leading-relaxed">{result.suggestions}</p>

            <button
              onClick={() => navigate({ to: "/skill-gap" })}
              className="mt-8 w-full py-4 rounded-2xl bg-yellow-300 text-[#171C4A] font-bold"
            >
              Back to Skill Gap Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6E8] px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate({ to: "/skill-gap" })}
          className="mb-8 px-5 py-3 bg-white shadow-lg rounded-2xl hover:scale-105 transition"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#171C4A]">AI Skill Assessment</h1>
          <p className="text-gray-500 mt-2">
            {careerGoal} • {questions.length} questions
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index} className="bg-white rounded-[32px] p-8 shadow-xl">
              <h3 className="text-lg font-bold text-[#171C4A] mb-4">
                {index + 1}. {q.question}
              </h3>
              <div className="space-y-3">
                {q.options.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition ${
                      answers[index] === option
                        ? "border-[#171C4A] bg-[#F8F6E8]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={answers[index] === option}
                      onChange={() => {
                        const updated = [...answers];
                        updated[index] = option;
                        setAnswers(updated);
                      }}
                      className="accent-[#171C4A]"
                    />
                    <span className="font-medium text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-8 py-5 rounded-2xl bg-[#171C4A] text-white text-lg font-bold hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Grading..." : "Submit Assessment →"}
        </button>
      </div>
    </div>
  );
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Try to get data from localStorage first (TanStack Router compatible)
  const localStorageData = localStorage.getItem("assessment_data");
  const state = localStorageData 
    ? JSON.parse(localStorageData) 
    : (location.state as unknown as AssessmentLocationState | null | undefined) ?? null;

  if (!state?.assessmentId || !state?.questions?.length) {
    navigate({ to: "/skill-gap", replace: true });
    return null;
  }

  return (
    <AssessmentQuiz
      assessmentId={state.assessmentId}
      questions={state.questions}
      careerGoal={state.careerGoal}
    />
  );
}
