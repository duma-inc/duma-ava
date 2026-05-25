"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { fetchVideoCatalog } from "@/services/videoService";
import { VideoItem } from "@/types/video";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VideoPlayerPage({ params }: PageProps) {
  const { id } = use(params);
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

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const video = useMemo(() => {
    return videos.find((item) => item.id === id) || null;
  }, [id, videos]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Carregando vídeo...</h2>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Não foi possível carregar o vídeo</h2>
        <Link href="/conteudo/videos" className="text-sm text-primary hover:underline">
          Voltar para vídeos
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Vídeo não encontrado</h2>
        <Link href="/conteudo/videos" className="text-sm text-primary hover:underline">
          Voltar para vídeos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/videos"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary truncate">
          {video.title}
        </h1>
      </div>

      {/* Embedded Iframe Player */}
      <div className="bg-black rounded-2xl border border-primary-darker overflow-hidden shadow-lg aspect-video relative w-full">
        <iframe
          src={video.embedUrl}
          className="absolute inset-0 w-full h-full border-none"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Description and Info */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 sm:p-6 shadow-md flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              {video.category}
            </span>
            <span className="text-xs text-primary-dark font-medium">
              Duração: {video.durationLabel}
            </span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-text-primary mt-2">{video.title}</h2>

        {video.description && (
          <p className="text-sm text-text-primary/90 mt-1 leading-relaxed">
            {video.description}
          </p>
        )}
      </div>
    </div>
  );
}
