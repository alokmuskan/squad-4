interface FeedbackItem {
  icon: string;
  bg: string;
  textClass: string;
}

const feedbackStyles: Record<string, FeedbackItem> = {
  strengths: { icon: "✓", bg: "bg-green-500/20", textClass: "text-green-100" },
  improvements: { icon: "→", bg: "bg-orange-500/20", textClass: "text-orange-100" },
  atsTips: { icon: "💡", bg: "bg-white/10", textClass: "text-white/90" },
};

interface Props {
  strengths?: string[];
  improvements?: string[];
  atsTips?: string[];
}

function FeedbackSection({
  title,
  items,
  style,
}: {
  title: string;
  items: string[];
  style: FeedbackItem;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <p className="text-white/70 mb-2 text-xs font-semibold">{title}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className={`${style.bg} rounded-lg px-3 py-1 text-xs ${style.textClass}`}>
            {style.icon} {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ResumeFeedbackList({ strengths, improvements, atsTips }: Props) {
  return (
    <>
      <FeedbackSection title="Strengths" items={strengths || []} style={feedbackStyles.strengths} />
      <FeedbackSection title="Areas to Improve" items={improvements || []} style={feedbackStyles.improvements} />
      <FeedbackSection title="ATS Optimization Tips" items={atsTips || []} style={feedbackStyles.atsTips} />
    </>
  );
}
