import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  divider?: boolean;
}

export default function Card({
  children,
  className = "",
  title,
  divider = false,
}: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-primary-darker p-4 shadow-md ${className}`}
    >
      {title && (
        <h3 className="text-primary font-bold text-base mb-2">{title}</h3>
      )}
      {divider && <div className="h-px bg-primary-darker mb-3" />}
      {children}
    </div>
  );
}
