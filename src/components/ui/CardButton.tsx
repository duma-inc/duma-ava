"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface CardButtonProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  color: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  /** Badge sobreposto no canto superior direito do card (nao afeta o tamanho). */
  badge?: ReactNode;
}

export default function CardButton({
  title,
  subtitle,
  icon,
  color,
  onClick,
  href,
  className = "",
  badge,
}: CardButtonProps) {
  const content = (
    <>
      {badge && <span className="absolute top-2 right-2 z-10">{badge}</span>}
      {icon && <span className="text-white">{icon}</span>}
      <span className="text-white text-lg font-bold text-center">{title}</span>
      {subtitle && (
        <span className="text-white/85 text-sm text-center">{subtitle}</span>
      )}
    </>
  );

  const containerClasses = `relative w-full min-h-[120px] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 shadow-lg transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${className}`;

  if (href) {
    return (
      <Link href={href} className={containerClasses} style={{ backgroundColor: color }}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={containerClasses}
      style={{ backgroundColor: color }}
    >
      {content}
    </button>
  );
}
