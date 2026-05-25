"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import { podcastEpisodesByCategory } from "@/mocks/podcasts";
import { PodcastCategory } from "@/types/podcast";
import InteractiveText from "@/components/reading/InteractiveText";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PodcastPlayerPage({ params }: PageProps) {
  const { id } = use(params);

  const episode = useMemo(() => {
    for (const cat in podcastEpisodesByCategory) {
      const ep = podcastEpisodesByCategory[cat as PodcastCategory].find((e) => e.id === id);
      if (ep) return ep;
    }
    return null;
  }, [id]);

  const parsedTranscriptLines = useMemo(() => {
    if (!episode?.transcript) return [];
    return episode.transcript
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, index) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx < 15) {
          const speaker = line.substring(0, colonIdx).trim();
          const text = line.substring(colonIdx + 1).trim();
          return { speaker, text, key: `${index}` };
        }
        return { speaker: null, text: line, key: `${index}` };
      });
  }, [episode]);

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Episódio não encontrado</h2>
        <Link href="/conteudo/podcasts" className="text-sm text-primary hover:underline">
          Voltar para podcasts
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/podcasts"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary truncate">
          {episode.title}
        </h1>
      </div>

      {/* Cover and Audio Player Card */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-center shadow-lg">
        <div className="relative w-32 h-32 rounded-xl overflow-hidden bg-primary-darker/20 shadow-md">
          <Image
            src={episode.coverImage}
            alt={episode.title}
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 w-full flex flex-col gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {episode.category}
            </span>
            <h2 className="text-lg font-bold text-text-primary mt-2">{episode.title}</h2>
            {episode.description && (
              <p className="text-xs text-primary-dark mt-1 leading-relaxed">
                {episode.description}
              </p>
            )}
          </div>

          {/* HTML5 Audio Player */}
          <div className="mt-2 w-full">
            <audio
              src={episode.audioSource}
              controls
              className="w-full h-10 accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Transcript Panel */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 sm:p-6 shadow-md flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-primary-darker pb-3">
          <MicrophoneIcon className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-text-primary">Transcrição Interativa</h3>
          <span className="text-[10px] text-primary-dark ml-auto font-medium">Clique nas palavras para traduzir</span>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
          {parsedTranscriptLines.map((line) => (
            <div key={line.key} className="flex flex-col gap-1">
              {line.speaker ? (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded
                    ${
                      line.speaker.toLowerCase() === "emma"
                        ? "bg-[#FDA91E]/20 text-[#FDA91E]"
                        : line.speaker.toLowerCase() === "lucas"
                        ? "bg-[#D88A00]/20 text-[#D88A00]"
                        : "bg-primary-darker/20 text-primary-dark"
                    }
                  `}>
                    {line.speaker}
                  </span>
                </div>
              ) : null}
              <div className="pl-1 text-sm text-text-primary leading-relaxed">
                <InteractiveText text={line.text} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
