"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon, PlayIcon } from "@heroicons/react/24/outline";
import { fetchVideoCatalog } from "@/services/videoService";
import { VideoCategory, VideoItem } from "@/types/video";

export default function VideosPage() {
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>("Aulas");
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
        if (catalog.categories.length > 0) {
          setSelectedCategory((current) => catalog.categories.includes(current) ? current : catalog.categories[0]);
        }
      } catch {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const list = useMemo(
    () => videos.filter((video) => video.category === selectedCategory),
    [selectedCategory, videos]
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">
          Vídeos
        </h1>
      </div>

      {/* Video Categories */}
      <div className="flex gap-2 border-b border-primary-darker/30 pb-2">
        {categories.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all cursor-pointer
                ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-primary-dark hover:text-primary"
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isLoading ? (
          <p className="text-primary-dark text-sm">Carregando vídeos...</p>
        ) : hasError ? (
          <p className="text-primary-dark text-sm">Não foi possível carregar os vídeos agora.</p>
        ) : list.length === 0 ? (
          <p className="text-primary-dark text-sm">Nenhum vídeo nesta categoria.</p>
        ) : (
          list.map((video) => (
            <Link
              key={video.id}
              href={`/conteudo/videos/${video.id}`}
              className="bg-surface rounded-2xl border border-primary-darker overflow-hidden flex flex-col hover:border-primary hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md group"
            >
              {/* Thumbnail Container */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1C1C1C]" />
                )}
                {/* Play Button Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/95 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <PlayIcon className="w-6 h-6 fill-current pl-0.5" />
                  </div>
                </div>
                {/* Duration Badge */}
                <span className="absolute bottom-2 right-2 bg-black/85 text-[10px] font-bold text-white px-2 py-0.5 rounded">
                  {video.durationLabel}
                </span>
              </div>

              {/* Text Context */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-1">
                <div>
                  <h3 className="text-base font-extrabold text-text-primary group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  {video.description && (
                    <p className="text-xs text-primary-dark mt-1 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-primary font-bold mt-2 uppercase tracking-wider">
                  Ver vídeo
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
