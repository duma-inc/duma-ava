"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, PlayIcon } from "@heroicons/react/24/outline";
import { fetchVideoCatalog } from "@/services/videoService";
import { VideoCategory, VideoItem } from "@/types/video";

export default function VideosPage() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setIsLoading(true);
      setHasError(false);

      try {
        const catalog = await fetchVideoCatalog();
        if (!isMounted) return;
        setCategories(catalog.categories);
        setVideos(catalog.videos);
      } catch {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const videosByCategory = useMemo(
    () =>
      categories.reduce<Record<string, VideoItem[]>>((acc, category) => {
        acc[category] = videos.filter((video) => video.category === category);
        return acc;
      }, {}),
    [categories, videos]
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">Vídeos</h1>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-text-primary">Biblioteca de Vídeos</h2>
        <p className="mt-2 text-sm leading-6 text-[#D2B98B]">
          Navegue entre aulas e conteúdos extras, abra o vídeo no player embutido e estude com uma experiência integrada.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-primary-dark">Carregando vídeos...</p>
      ) : hasError ? (
        <p className="text-sm text-primary-dark">Não foi possível carregar os vídeos agora.</p>
      ) : (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryVideos = videosByCategory[category] || [];

            return (
              <section key={category} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-primary">{category}</h3>
                  <p className="text-xs text-primary-dark">
                    {categoryVideos.length} vídeo{categoryVideos.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {categoryVideos.length === 0 ? (
                  <p className="text-sm text-primary-dark">Nenhum vídeo nesta categoria.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {categoryVideos.map((video) => (
                      <Link
                        key={video.id}
                        href={`/conteudo/videos/${video.id}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-primary-darker bg-surface shadow-md transition-all hover:scale-[1.01] hover:border-primary cursor-pointer"
                      >
                        <div className="relative flex aspect-video w-full items-center justify-center bg-black">
                          {video.thumbnailUrl ? (
                            <Image
                              src={video.thumbnailUrl}
                              alt={video.title}
                              fill
                              sizes="(max-width: 640px) 100vw, 50vw"
                              className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                            />
                          ) : (
                            <div className="h-full w-full bg-[#1C1C1C]" />
                          )}

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/95 text-black shadow-lg transition-transform duration-200 group-hover:scale-110">
                              <PlayIcon className="h-6 w-6 fill-current pl-0.5" />
                            </div>
                          </div>

                          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-2 py-0.5 text-[10px] font-bold text-white">
                            {video.durationLabel}
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col justify-between gap-1 p-4">
                          <div>
                            <h4 className="text-base font-extrabold text-text-primary transition-colors group-hover:text-primary">
                              {video.title}
                            </h4>
                            {video.description && (
                              <p className="mt-1 text-xs leading-relaxed text-primary-dark">
                                {video.description}
                              </p>
                            )}
                          </div>
                          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                            Ver vídeo
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
