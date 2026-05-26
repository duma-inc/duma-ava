import Link from "next/link";
import Image from "next/image";
import { Bars3Icon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface GameLibraryCardProps {
  href: string;
  title: string;
  description: string;
  tag: string;
  imageSrc: string;
  accentColorClass: string;
  accentBackgroundClass: string;
  borderColorClass: string;
  packCount: number;
  coverClassName: string;
}

export default function GameLibraryCard({
  href,
  title,
  description,
  tag,
  imageSrc,
  accentColorClass,
  accentBackgroundClass,
  borderColorClass,
  packCount,
  coverClassName,
}: GameLibraryCardProps) {
  return (
    <Link
      href={href}
      className={`block overflow-hidden rounded-[22px] border bg-surface transition-all hover:brightness-110 cursor-pointer ${borderColorClass}`}
    >
      <div className={`relative h-44 w-full ${coverClassName}`}>
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 672px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute left-3 top-3 rounded-full border border-current bg-black/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-current">
          {tag}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h2 className="mb-2 text-2xl font-extrabold text-text-primary">{title}</h2>
          <p className="text-sm leading-6 text-[#A08060]">{description}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className={`flex items-center gap-2 text-sm font-bold ${accentColorClass}`}>
            <Bars3Icon className="h-4 w-4" />
            <span>
              {packCount} pack{packCount !== 1 ? "s" : ""} disponíve{packCount !== 1 ? "is" : "l"}
            </span>
          </div>

          <div className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-extrabold text-black ${accentBackgroundClass}`}>
            <span>Jogar</span>
            <ChevronRightIcon className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
