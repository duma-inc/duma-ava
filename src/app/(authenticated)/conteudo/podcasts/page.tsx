"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { podcastCategories, podcastEpisodesByCategory } from "@/mocks/podcasts";
import { PodcastCategory } from "@/types/podcast";

export default function PodcastsPage() {
  const [selectedCategory, setSelectedCategory] = useState<PodcastCategory>("Contos");

  const episodes = podcastEpisodesByCategory[selectedCategory] || [];

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
          Podcasts
        </h1>
      </div>

      {/* Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {podcastCategories.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap cursor-pointer
                ${
                  active
                    ? "bg-primary border-primary text-black"
                    : "bg-surface border-primary-darker text-primary-dark hover:border-primary hover:text-primary"
                }
              `}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Episodes List */}
      <div className="flex flex-col gap-4">
        {episodes.length === 0 ? (
          <p className="text-primary-dark text-sm">Nenhum episódio nesta categoria.</p>
        ) : (
          episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/conteudo/podcasts/${ep.id}`}
              className="flex bg-surface rounded-2xl border border-primary-darker overflow-hidden shadow-md hover:border-primary hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <div className="relative w-28 h-28 flex-shrink-0 bg-primary-darker/20">
                <Image
                  src={ep.coverImage}
                  alt={ep.title}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                    {ep.category}
                  </span>
                  <h3 className="text-base font-bold text-text-primary mt-1.5 line-clamp-1">
                    {ep.title}
                  </h3>
                  {ep.description && (
                    <p className="text-xs text-primary-dark mt-1 line-clamp-2">
                      {ep.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-primary-dark mt-2">
                  <span>Duração: {ep.durationLabel}</span>
                  <span className="text-primary font-bold">Ouvir agora →</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
