interface Props {
  summary?: string;
  careerFitSummary?: string;
}

export default function ResumeSummary({ summary, careerFitSummary }: Props) {
  if (!summary && !careerFitSummary) return null;

  return (
    <>
      {summary && (
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-white/70 mb-2 text-xs font-semibold">Professional Summary</p>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {careerFitSummary && (
        <div className="mt-4 bg-yellow-300/20 border border-yellow-300/30 rounded-xl p-4">
          <p className="text-yellow-200 mb-2 text-xs font-semibold">Career Fit Insight</p>
          <p className="text-white/90 text-sm">{careerFitSummary}</p>
        </div>
      )}
    </>
  );
}
