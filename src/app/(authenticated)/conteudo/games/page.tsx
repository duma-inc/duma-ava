"use client";

import Link from "next/link";
import { ChevronLeftIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { sentenceBuilderPacks } from "@/mocks/games";

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
        <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
            <PuzzlePieceIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Sentence Builder</h2>
            <p className="text-xs text-primary-dark mt-1 leading-relaxed">
              Arraste e organize os blocos de palavras na ordem correta para construir frases perfeitas em inglês! Pratique sintaxe e gramática de forma leve e divertida.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-primary uppercase tracking-wider mt-2">
          Pacotes Disponíveis
        </span>

        <div className="flex flex-col gap-3">
          {sentenceBuilderPacks.map((pack) => (
            <div
              key={pack.id}
              className="bg-surface rounded-2xl border border-primary-darker p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-primary transition-colors"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {pack.weekLabel}
                  </span>
                  <h3 className="text-sm font-bold text-text-primary truncate">
                    {pack.title}
                  </h3>
                </div>
                <p className="text-xs text-primary-dark line-clamp-1 mt-1 leading-relaxed">
                  {pack.description}
                </p>
                <span className="text-[11px] text-primary-dark">
                  Total de frases: {pack.sentences.length}
                </span>
              </div>
              
              <Link
                href={`/conteudo/games/${pack.id}`}
                className="px-5 py-2.5 bg-primary hover:brightness-110 text-black text-xs font-extrabold rounded-xl transition-all text-center cursor-pointer shadow-md"
              >
                Jogar
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
