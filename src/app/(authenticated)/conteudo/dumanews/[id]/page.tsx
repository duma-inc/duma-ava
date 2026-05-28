"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import InteractiveMarkdown from "@/components/reading/InteractiveMarkdown";
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

    void loadArticle();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-primary-dark">Carregando notícia...</p>;
  }

  if (hasError && !article) {
    return <p className="text-sm text-primary-dark">Não foi possível carregar esta notícia agora.</p>;
  }

  if (!article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Artigo não encontrado</h2>
        <Link href="/conteudo/dumanews" className="text-sm text-primary hover:underline">
          Voltar para notícias
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      {isFullscreen && (
        <div
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/dumanews"
          className="z-50 rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      {!isFullscreen && (
        <div className="rounded-2xl border border-primary-darker bg-[#1C1C1C] p-5 shadow-md sm:p-7">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
            {article.category}
          </span>
          <div className="mt-4 text-lg font-black leading-snug text-text-primary sm:text-xl">
            <InteractiveText
              text={article.headline}
              fontSize={fontSize}
              lineHeight={Math.round(fontSize * 1.5)}
            />
          </div>
          <div className="my-4 h-px bg-primary-darker/30" />
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-primary-dark">{article.source}</span>
            <span className="text-[#8F8A7E]">{article.publishedAt}</span>
          </div>
        </div>
      )}

      <div
        className={
          isFullscreen
            ? "fixed inset-4 top-20 z-40 mx-auto flex w-auto max-w-4xl flex-col gap-4 overflow-y-auto rounded-2xl border border-primary bg-[#1C1C1C] p-5 shadow-2xl transition-all duration-300 sm:inset-10 sm:top-24 md:inset-16 md:top-24"
            : "flex w-full flex-col gap-4 rounded-2xl border border-primary-darker bg-[#1C1C1C] p-5 shadow-md sm:p-7"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-darker/30 pb-3 text-xs font-medium text-primary-dark">
          <span>Conteúdo</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFontSize((prev) => Math.max(13, prev - 2))}
              disabled={fontSize <= 13}
              className={`rounded border border-primary-darker bg-surface p-1.5 text-primary transition-all ${
                fontSize <= 13 ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:border-primary"
              }`}
              title="Diminuir fonte"
            >
              <MinusIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setFontSize((prev) => Math.min(25, prev + 2))}
              disabled={fontSize >= 25}
              className={`rounded border border-primary-darker bg-surface p-1.5 text-primary transition-all ${
                fontSize >= 25 ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:border-primary"
              }`}
              title="Aumentar fonte"
            >
              <PlusIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="cursor-pointer rounded border border-primary-darker bg-surface p-1.5 text-primary transition-all hover:border-primary"
              title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
            >
              {isFullscreen ? (
                <ArrowsPointingInIcon className="h-3.5 w-3.5" />
              ) : (
                <ArrowsPointingOutIcon className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {!isFullscreen && (
          <p className="text-sm leading-6 text-[#D2B98B]">
            Toque nas palavras do título ou do texto para revisar vocabulário e salvar flashcards.
          </p>
        )}

        <div className="mt-2 border-t border-primary-darker/10 pt-2 text-sm leading-relaxed text-text-primary/90">
          <InteractiveMarkdown
            markdown={article.content}
            fontSize={fontSize}
            lineHeight={Math.round(fontSize * 1.6)}
          />
        </div>
      </div>
    </div>
  );
}
