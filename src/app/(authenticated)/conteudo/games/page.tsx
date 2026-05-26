"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import GameLibraryCard from "@/components/ui/GameLibraryCard";
import { gameCatalog } from "@/lib/gameCatalog";

export default function GamesPage() {
  return (
    <div className="flex flex-col gap-6 pb-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">
          Games
        </h1>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-[26px] font-extrabold text-text-primary">Game Station</h1>
          <p className="mt-2 text-sm leading-6 text-[#D2B98B]">
            Aprenda inglês jogando. Cada game tem seu próprio desafio semanal — toque para ver os packs disponíveis.
          </p>
        </div>

        {gameCatalog.map((game) => (
          <GameLibraryCard
            key={game.id}
            href={`/conteudo/games/${game.id}`}
            title={game.title}
            description={game.description}
            tag={game.tag}
            imageSrc={game.imageSrc}
            accentColorClass={game.accentColorClass}
            accentBackgroundClass={game.accentBackgroundClass}
            borderColorClass={game.borderColorClass}
            packCount={game.packCount}
            coverClassName={game.coverClassName}
          />
        ))}
      </div>
    </div>
  );
}
