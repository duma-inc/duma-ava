"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200 cursor-pointer select-none";

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const variants = {
    primary:
      "bg-primary text-text-on-primary border border-primary-dark shadow-[0_4px_12px_rgba(253,169,30,0.35)] hover:shadow-[0_6px_20px_rgba(253,169,30,0.5)] hover:brightness-110 active:scale-[0.97]",
    outlined:
      "bg-transparent text-text-primary border-[1.5px] border-primary-darker hover:border-primary-dark hover:text-primary active:scale-[0.97]",
    ghost:
      "bg-transparent text-primary-dark hover:bg-primary-darker/20 active:scale-[0.97]",
  };

  const disabledStyle =
    "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${
        disabled || loading ? disabledStyle : ""
      } ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
