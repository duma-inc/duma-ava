interface ProgressBarProps {
  value: number; // 0–100
  color?: string;
  height?: number;
  className?: string;
}

export default function ProgressBar({
  value,
  color = "#FDA91E",
  height = 6,
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={`w-full bg-primary-darker rounded-full overflow-hidden ${className}`}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clampedValue}%`, backgroundColor: color }}
      />
    </div>
  );
}
