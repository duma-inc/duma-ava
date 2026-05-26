import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

interface MetricBarProps {
  label: string;
  value: number | string; // 0–100 ou texto
  percent?: number; // porcentagem para a barra
  color: string;
  icon: ReactNode;
  suffix?: string;
}

export default function MetricBar({ label, value, percent, color, icon, suffix = "%" }: MetricBarProps) {
  const barPercent = percent !== undefined ? percent : (typeof value === 'number' ? Math.min(100, Math.max(0, value)) : 100);
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
          {value}{suffix}
        </span>
      </div>
      <ProgressBar value={barPercent} color={color} height={8} />
    </div>
  );
}
