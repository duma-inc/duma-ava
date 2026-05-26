import Link from "next/link";

interface LessonChapterCardProps {
  href: string;
  order: number;
  title: string;
  summary: string;
}

export default function LessonChapterCard({
  href,
  order,
  title,
  summary,
}: LessonChapterCardProps) {
  return (
    <Link
      href={href}
      className="block w-full rounded-xl border border-primary-darker bg-surface px-4 py-4 transition-all hover:border-primary hover:bg-primary/5 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          {order}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-base font-extrabold text-text-primary">{title}</h3>
          <p className="text-sm leading-6 text-[#D2B98B]">{summary}</p>
        </div>
      </div>
    </Link>
  );
}
