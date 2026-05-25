import {
  FaceSmileIcon,
  FaceFrownIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";

type Sentiment = "positive" | "neutral" | "negative";

export interface Feedback {
  id: string;
  author: string;
  text: string;
  date: string;
  sentiment: Sentiment;
}

const sentimentConfig: Record<
  Sentiment,
  { Icon: typeof FaceSmileIcon; color: string }
> = {
  positive: { Icon: FaceSmileIcon, color: "#FDA91E" },
  neutral: { Icon: MinusCircleIcon, color: "#D88A00" },
  negative: { Icon: FaceFrownIcon, color: "#7A4A12" },
};

interface FeedbackCardProps {
  feedback: Feedback;
}

export default function FeedbackCard({ feedback }: FeedbackCardProps) {
  const { Icon, color } = sentimentConfig[feedback.sentiment];

  return (
    <div
      className="bg-surface rounded-xl p-4 mb-2.5 border border-primary-darker shadow-md"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div className="flex items-center mb-2 gap-2">
        <span
          className="rounded-full p-1.5 flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color }} />
        </span>
        <span className="flex-1 text-sm font-bold text-text-primary">
          {feedback.author}
        </span>
        <span className="text-xs text-primary-dark">{feedback.date}</span>
      </div>
      <p className="text-sm text-text-primary leading-5">{feedback.text}</p>
    </div>
  );
}
