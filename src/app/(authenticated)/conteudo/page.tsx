"use client";

import CardButton from "@/components/ui/CardButton";
import {
  MicrophoneIcon,
  PlayCircleIcon,
  BookOpenIcon,
  PuzzlePieceIcon,
  NewspaperIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import InteractiveText from "@/components/reading/InteractiveText";

export default function ConteudoPage() {
  const sampleText = "The quick brown fox jumps over the lazy dog. Programming is a challenging but rewarding skill that requires logic and creativity. This is a sample text to test the interactive reading and flashcards system! Click any word to translate and save it.";

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-[22px] font-extrabold text-text-primary mb-5 mt-2">
          Materiais e Mídias
        </h1>

        <div className="grid grid-cols-2 gap-3">
          <CardButton
            title="Podcasts"
            subtitle="Ouça onde quiser"
            color="#FDA91E"
            icon={<MicrophoneIcon className="w-9 h-9" />}
            href="/conteudo/podcasts"
          />
          <CardButton
            title="Vídeos"
            subtitle="Aprenda visualizando"
            color="#D88A00"
            icon={<PlayCircleIcon className="w-9 h-9" />}
            href="/conteudo/videos"
          />
          <CardButton
            title="Apostila"
            subtitle="Material completo"
            color="#7A4A12"
            icon={<BookOpenIcon className="w-9 h-9" />}
            href="/conteudo/apostila"
          />
          <CardButton
            title="Games"
            subtitle="Pratique jogando"
            color="#FDA91E"
            icon={<PuzzlePieceIcon className="w-9 h-9" />}
            href="/conteudo/games"
          />
          <CardButton
            title="Notícias"
            subtitle="Fique por dentro"
            color="#D88A00"
            icon={<NewspaperIcon className="w-9 h-9" />}
            href="/conteudo/dumanews"
          />
          <CardButton
            title="Flashcards"
            subtitle="Revise rápido"
            color="#7A4A12"
            icon={<Square3Stack3DIcon className="w-9 h-9" />}
            href="/flashcards"
          />
        </div>
      </div>

      <div className="bg-[#1C1C1C] border border-surface rounded-2xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-4">Texto de Teste Interativo</h2>
        <InteractiveText text={sampleText} />
      </div>
    </div>
  );
}
