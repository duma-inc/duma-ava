import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

interface MetricBarProps {
  label: string;
  value: number; // 0–100
  color: string;
  icon: ReactNode;
}

export default function MetricBar({ label, value, color, icon }: MetricBarProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center mb-1.5 gap-2">
        <span
          className="rounded-lg p-1.5 flex items-center justify-center"
          style={{ backgroundColor: `${color}22` }}
        >
          {icon}
        </span>
        <span className="flex-1 text-sm font-semibold text-text-primary">
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {value}%
        </span>
      </div>
      <ProgressBar value={value} color={color} height={8} />
    </div>
  );
}
