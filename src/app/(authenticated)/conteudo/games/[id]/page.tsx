"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { dumaQuizPacks, sentenceBuilderPacks } from "@/mocks/games";
import { getGameDefinition } from "@/lib/gameCatalog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GamePacksPage({ params }: PageProps) {
  const { id } = use(params);
  const game = getGameDefinition(id);
  const packs = useMemo(() => {
    if (id === "sentence-builder") {
      return sentenceBuilderPacks.map((pack) => ({
        id: pack.id,
        weekLabel: pack.weekLabel,
        description: pack.description,
        itemCount: `${pack.sentences.length} frases`,
      }));
    }

    if (id === "duma-quiz") {
      return dumaQuizPacks.map((pack) => ({
        id: pack.id,
        weekLabel: pack.weekLabel,
        description: pack.description,
        itemCount: `${pack.questions.length} perguntas`,
      }));
    }

    return [];
  }, [id]);

  if (!game) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Game não encontrado</h2>
        <Link href="/conteudo/games" className="text-sm text-primary hover:underline">
          Voltar para games
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/games"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">{game.title}</h1>
      </div>

      <div className={`overflow-hidden rounded-[22px] ${game.coverClassName}`}>
        <div className="relative px-5 py-12">
          <Image
            src={game.imageSrc}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative">
          <span className={`rounded-full border border-current bg-black/40 px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${game.accentColorClass}`}>
            {game.tag}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-text-primary">{game.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#D2B98B]">{game.description}</p>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-extrabold text-primary">Packs disponíveis</h3>

      <div className="space-y-3">
        {packs.map((pack, index) => {
          const isLatest = index === packs.length - 1;

          return (
            <Link
              key={pack.id}
              href={`/conteudo/games/${id}/${pack.id}`}
              className={`flex items-center gap-4 rounded-2xl border bg-surface p-4 transition-all hover:brightness-110 cursor-pointer ${isLatest ? game.borderColorClass : "border-primary-darker"}`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-lg font-extrabold ${isLatest ? `${game.accentColorClass} bg-current/10` : "bg-white/5 text-[#A08060]"}`}
              >
                {index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-bold text-text-primary">{pack.weekLabel}</h4>
                  {isLatest && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${game.accentColorClass} bg-current/10`}>
                      Novo
                    </span>
                  )}
                </div>
                <p className="text-sm leading-5 text-[#A08060]">{pack.description}</p>
                <p className={`mt-2 text-xs font-bold ${game.accentColorClass}`}>{pack.itemCount}</p>
              </div>

              <span className={`text-xl ${isLatest ? game.accentColorClass : "text-[#555]"}`}>›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
