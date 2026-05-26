"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import InteractiveText from "@/components/reading/InteractiveText";
import { fetchPodcastCategoryGroups } from "@/services/podcastService";
import { PodcastEpisode } from "@/types/podcast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PodcastPlayerPage({ params }: PageProps) {
  const { id } = use(params);
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEpisodes() {
      setIsLoading(true);
      setHasError(false);

      try {
        const groups = await fetchPodcastCategoryGroups();
        if (!isMounted) return;
        setEpisodes(groups.flatMap((group) => group.episodes));
      } catch {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadEpisodes();

    return () => {
      isMounted = false;
    };
  }, []);

  const episode = useMemo(() => episodes.find((item) => item.id === id) || null, [episodes, id]);

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

  if (isLoading) {
    return <p className="text-sm text-primary-dark">Carregando episódio...</p>;
  }

  if (hasError) {
    return <p className="text-sm text-primary-dark">Não foi possível carregar o episódio agora.</p>;
  }

  if (!episode) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Episódio não encontrado</h2>
        <Link href="/conteudo/podcasts" className="text-sm text-primary hover:underline">
          Voltar para podcasts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/podcasts"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="truncate text-[22px] font-extrabold text-text-primary">{episode.title}</h1>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-2xl border border-primary-darker bg-[#1C1C1C] p-5 shadow-lg sm:flex-row">
        <div className="h-32 w-32 overflow-hidden rounded-xl bg-primary-darker/20 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={episode.coverImage} alt={episode.title} className="h-full w-full object-cover" />
        </div>

        <div className="flex w-full flex-1 flex-col gap-3">
          <div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary">
              {episode.category}
            </span>
            <h2 className="mt-2 text-lg font-bold text-text-primary">{episode.title}</h2>
            {episode.description && (
              <p className="mt-1 text-xs leading-relaxed text-primary-dark">{episode.description}</p>
            )}
          </div>

          <audio src={episode.audioSource} controls className="mt-2 h-10 w-full accent-primary" />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-primary-darker bg-[#1C1C1C] p-5 shadow-md sm:p-6">
        <div className="flex items-center gap-2 border-b border-primary-darker pb-3">
          <MicrophoneIcon className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-text-primary">Transcrição Interativa</h3>
          <span className="ml-auto text-[10px] font-medium text-primary-dark">
            Clique nas palavras para traduzir
          </span>
        </div>

        <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
          {parsedTranscriptLines.map((line) => (
            <div key={line.key} className="flex flex-col gap-1">
              {line.speaker ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      line.speaker.toLowerCase() === "emma"
                        ? "bg-[#FDA91E]/20 text-[#FDA91E]"
                        : line.speaker.toLowerCase() === "lucas"
                          ? "bg-[#D88A00]/20 text-[#D88A00]"
                          : "bg-primary-darker/20 text-primary-dark"
                    }`}
                  >
                    {line.speaker}
                  </span>
                </div>
              ) : null}
              <div className="pl-1 text-sm leading-relaxed text-text-primary">
                <InteractiveText text={line.text} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
