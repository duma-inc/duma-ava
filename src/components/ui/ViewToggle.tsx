"use client";

export type ViewMode = "month" | "week" | "day";

interface ViewToggleProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const options: { mode: ViewMode; label: string }[] = [
  { mode: "month", label: "Mês" },
  { mode: "week", label: "Semana" },
  { mode: "day", label: "Dia" },
];

export default function ViewToggle({ current, onChange }: ViewToggleProps) {
  return (
    <div className="flex bg-surface rounded-xl p-1 border border-primary-darker gap-1 mb-4">
      {options.map(({ mode, label }) => {
        const active = current === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
              active
                ? "bg-primary-darker text-primary font-bold shadow-sm"
                : "text-primary-darker hover:text-primary-dark"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
