"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import InteractiveText from "@/components/reading/InteractiveText";
import { fetchNewsArticleById } from "@/services/newsService";
import { NewsArticle } from "@/types/news";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewsArticlePage({ params }: PageProps) {
  const { id } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [fontSize, setFontSize] = useState(17);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadArticle() {
      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetchNewsArticleById(id);
        if (!isMounted) return;
        setArticle(response);
      } catch {
        if (!isMounted) return;
        setHasError(true);
        setArticle(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadArticle();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <p className="text-primary-dark text-sm">Carregando notícia...</p>;
  }

  if (hasError && !article) {
    return <p className="text-primary-dark text-sm">Não foi possível carregar esta notícia agora.</p>;
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Artigo não encontrado</h2>
        <Link href="/conteudo/dumanews" className="text-sm text-primary hover:underline">
          Voltar para notícias
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-2xl mx-auto w-full">
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/dumanews"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer z-50"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex flex-col min-w-0 z-40">
          <span className="text-[10px] text-primary-dark uppercase font-bold truncate">
            {article.category}
          </span>
          <h1 className="text-base font-extrabold text-text-primary truncate">
            {article.headline}
          </h1>
        </div>
      </div>

      {/* Article Body Container */}
      <div
        className={
          isFullscreen
            ? "fixed inset-4 top-20 sm:inset-10 sm:top-24 md:inset-16 md:top-24 z-40 bg-[#1C1C1C] border border-primary rounded-2xl p-5 sm:p-7 shadow-2xl overflow-y-auto flex flex-col gap-4 max-w-4xl mx-auto w-full transition-all duration-300"
            : "bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 sm:p-7 shadow-md flex flex-col gap-4 w-full"
        }
      >
        {/* Source, Date metadata & Action Bar */}
        <div className="flex items-center justify-between border-b border-primary-darker/30 pb-3 text-xs text-primary-dark font-medium flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span>Fonte: {article.source}</span>
            <span>Publicado em: {article.publishedAt}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize(prev => Math.max(13, prev - 2))}
              disabled={fontSize <= 13}
              className={`p-1.5 rounded bg-surface border border-primary-darker text-primary transition-all cursor-pointer ${
                fontSize <= 13 ? "opacity-40 cursor-not-allowed" : "hover:border-primary"
              }`}
              title="Diminuir fonte"
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFontSize(prev => Math.min(25, prev + 2))}
              disabled={fontSize >= 25}
              className={`p-1.5 rounded bg-surface border border-primary-darker text-primary transition-all cursor-pointer ${
                fontSize >= 25 ? "opacity-40 cursor-not-allowed" : "hover:border-primary"
              }`}
              title="Aumentar fonte"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-1.5 rounded bg-surface border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="w-3.5 h-3.5" />
              ) : (
                <ArrowsPointingOutIcon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-lg sm:text-xl font-black text-text-primary leading-snug">
          {article.headline}
        </h2>

        {/* Content with InteractiveText translation helper */}
        <div className="text-sm text-text-primary/90 leading-relaxed mt-2 pt-2 border-t border-primary-darker/10">
          <InteractiveText
            text={article.content}
            fontSize={fontSize}
            lineHeight={Math.round(fontSize * 1.6)}
          />
        </div>
      </div>
    </div>
  );
}
