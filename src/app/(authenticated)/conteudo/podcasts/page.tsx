"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { fetchPodcastCategoryGroups } from "@/services/podcastService";
import { PodcastCategoryGroup } from "@/types/podcast";

export default function PodcastsPage() {
  const [categoryGroups, setCategoryGroups] = useState<PodcastCategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPodcasts() {
      try {
        setIsLoading(true);
        setLoadError(null);
        const groupedEpisodes = await fetchPodcastCategoryGroups();

        if (!isMounted) return;
        setCategoryGroups(groupedEpisodes);
      } catch {
        if (!isMounted) return;
        setLoadError("Não foi possível carregar os podcasts agora. Tente novamente em instantes.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPodcasts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">Podcasts</h1>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-text-primary">Biblioteca de Podcasts</h2>
        <p className="mt-2 text-sm leading-6 text-[#D2B98B]">
          Explore categorias, escolha um episódio e acompanhe a transcrição interativa para salvar vocabulário em flashcards.
        </p>
      </div>

      {isLoading && <p className="text-sm text-primary-dark">Carregando podcasts...</p>}

      {!!loadError && (
        <div className="rounded-2xl border border-[#A94442] bg-[#2A1717] p-4">
          <p className="text-sm text-text-primary">{loadError}</p>
        </div>
      )}

      {!isLoading && !loadError && categoryGroups.length === 0 && (
        <div className="rounded-2xl border border-primary-darker bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary">Nenhuma categoria disponível</p>
          <p className="mt-1 text-sm text-[#D2B98B]">
            O backend ainda não retornou categorias de podcast para exibição.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {categoryGroups.map(({ category, episodes }) => (
          <section key={category.id} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-primary">{category.name}</h3>
              <p className="text-xs text-primary-dark">
                {episodes.length} episódio{episodes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {episodes.length === 0 ? (
              <div className="rounded-2xl border border-primary-darker bg-surface p-4">
                <p className="text-sm font-semibold text-text-primary">Nenhum áudio disponível</p>
                <p className="mt-1 text-sm text-[#D2B98B]">
                  Ainda não há episódios publicados nesta categoria.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {episodes.map((episode) => (
                  <Link
                    key={episode.id}
                    href={`/conteudo/podcasts/${episode.id}`}
                    className="flex overflow-hidden rounded-2xl border border-primary-darker bg-surface shadow-md transition-all hover:scale-[1.01] hover:border-primary cursor-pointer"
                  >
                    <div className="h-28 w-28 shrink-0 bg-primary-darker/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={episode.coverImage}
                        alt={episode.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {episode.category}
                        </span>
                        <h4 className="mt-1.5 text-base font-bold text-text-primary">{episode.title}</h4>
                        {episode.description && (
                          <p className="mt-1 text-xs text-primary-dark">{episode.description}</p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-primary-dark">
                        <span>Duração: {episode.durationLabel}</span>
                        <span className="font-bold text-primary">Ouvir agora →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
