"use client";

import { ReactNode } from "react";

interface BorderedCardProps {
  title: string;
  actionLabel?: string;
  icon?: ReactNode;
  color: string;
  onClick?: () => void;
  className?: string;
}

export default function BorderedCard({
  title,
  actionLabel = "Matricular-se",
  icon,
  color,
  onClick,
  className = "",
}: BorderedCardProps) {
  return (
    <button
      onClick={onClick}
      className={`bg-surface rounded-xl p-4 flex flex-col items-center justify-center gap-2 border border-primary-darker shadow-md transition-all duration-200 hover:border-primary-dark hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${className}`}
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      {icon && (
        <span
          className="rounded-xl p-2.5 mb-1"
          style={{ backgroundColor: `${color}22` }}
        >
          {icon}
        </span>
      )}
      <span className="text-sm font-semibold text-text-primary text-center">
        {title}
      </span>
      <span className="text-xs font-semibold text-primary">{actionLabel}</span>
    </button>
  );
}
