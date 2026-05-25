import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export default function Badge({
  children,
  color = "#FDA91E",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}
      style={{
        backgroundColor: `${color}22`,
        color: color,
      }}
    >
      {children}
    </span>
  );
}
