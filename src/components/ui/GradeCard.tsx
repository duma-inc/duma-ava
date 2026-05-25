import { ReactNode } from "react";
import ProgressBar from "./ProgressBar";

interface GradeCardProps {
  courseName: string;
  grade: number; // 0–10
  color: string;
  icon: ReactNode;
}

function gradeLabel(g: number): { label: string; color: string } {
  if (g >= 9) return { label: "Excelente", color: "#10B981" };
  if (g >= 7) return { label: "Bom", color: "#3B82F6" };
  if (g >= 5) return { label: "Regular", color: "#FDA91E" };
  return { label: "Insuficiente", color: "#EF4444" };
}

export default function GradeCard({
  courseName,
  grade,
  color,
  icon,
}: GradeCardProps) {
  const { label, color: labelColor } = gradeLabel(grade);
  const pct = (grade / 10) * 100;

  return (
    <div className="bg-surface rounded-xl p-4 mb-2.5 flex items-center border border-primary-darker shadow-md gap-3.5">
      <span
        className="rounded-xl p-2.5 flex items-center justify-center"
        style={{ backgroundColor: `${color}22` }}
      >
        {icon}
      </span>

      <div className="flex-1">
        <p className="text-sm font-semibold text-text-primary mb-1.5">
          {courseName}
        </p>
        <ProgressBar value={pct} color={color} />
      </div>

      <div className="text-right ml-3.5">
        <p className="text-2xl font-extrabold" style={{ color }}>
          {grade.toFixed(1)}
        </p>
        <span
          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
          style={{ backgroundColor: `${labelColor}22`, color: labelColor }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
