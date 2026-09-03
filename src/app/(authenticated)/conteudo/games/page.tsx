"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import GameLibraryCard from "@/components/ui/GameLibraryCard";
import { gameCatalog } from "@/lib/gameCatalog";
import { fetchStudentGames, StudentGame } from "@/services/gameService";
import { useSkillProfile } from "@/store/SkillProfileContext";

export default function GamesPage() {
  const { selectedSkill } = useSkillProfile();
  const [catalog, setCatalog] = useState<{ skillId: number | null; games: StudentGame[] }>({ skillId: null, games: [] });

  useEffect(() => {
    const skillId = selectedSkill?.id ?? null;
    let cancelled = false;
    void fetchStudentGames()
      .then((games) => { if (!cancelled) setCatalog({ skillId, games }); })
      .catch(() => { if (!cancelled) setCatalog({ skillId, games: [] }); });
    return () => { cancelled = true; };
  }, [selectedSkill?.id]);

  const availableCatalog = useMemo(() => gameCatalog.map((game) => {
    const games = catalog.skillId === (selectedSkill?.id ?? null) ? catalog.games : [];
    const nativeKind = game.id === "sentence-builder" ? "SENTENCE_BUILDER" : "QUIZ";
    const serverCount = games.filter((item) => item.type === "NATIVE" && item.nativeKind === nativeKind).length;
    const packCount = serverCount || (selectedSkill?.contentLocale?.startsWith("en") ? game.packCount : 0);
    return { ...game, packCount };
  }).filter((game) => game.packCount > 0), [catalog, selectedSkill?.id, selectedSkill?.contentLocale]);

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
            Aprenda jogando. Cada game tem seu próprio desafio semanal — toque para ver os packs disponíveis.
          </p>
        </div>

        {availableCatalog.map((game) => (
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
        {availableCatalog.length === 0 && (
          <div className="rounded-2xl border border-primary-darker bg-surface p-6 text-center text-sm text-primary-dark">
            Nenhum game disponível para esta skill.
          </div>
        )}
      </div>
    </div>
  );
}
