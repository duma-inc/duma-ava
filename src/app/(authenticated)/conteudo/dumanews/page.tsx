"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { fetchNewsCatalog } from "@/services/newsService";
import { NewsArticle, NewsCategory } from "@/types/news";

export default function DumaNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("Geral");
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setIsLoading(true);
      setHasError(false);

      try {
        const catalog = await fetchNewsCatalog();
        if (!isMounted) return;

        setCategories(catalog.categories);
        setArticles(catalog.articles);
        if (catalog.categories.length > 0) {
          setSelectedCategory((current) =>
            catalog.categories.includes(current) ? current : catalog.categories[0]
          );
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

    void loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticles = useMemo(
    () => articles.filter((article) => article.category === selectedCategory),
    [articles, selectedCategory]
  );

  const featuredArticle = useMemo(
    () => articles.find((article) => article.highlightedArticle) || null,
    [articles]
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">DumaNews</h1>
      </div>

      <p className="text-sm leading-6 text-[#D2B98B]">
        Leia as manchetes do dia, abra a matéria completa e toque nas palavras do título ou do conteúdo para criar flashcards.
      </p>

      {featuredArticle && featuredArticle.category === selectedCategory && (
        <Link
          href={`/conteudo/dumanews/${featuredArticle.id}`}
          className="rounded-2xl border border-primary bg-[#22190a] p-5 shadow-md transition-all hover:scale-[1.01] hover:border-primary cursor-pointer"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
              {featuredArticle.category}
            </span>
            <span className="text-primary-dark">›</span>
          </div>
          <h2 className="text-2xl font-extrabold leading-8 text-text-primary">{featuredArticle.headline}</h2>
          <p className="mt-3 text-sm leading-6 text-[#D2B98B]">{featuredArticle.summary}</p>
          <div className="mt-4 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-primary-dark">{featuredArticle.source}</span>
            <span className="text-[#8F8A7E]">{featuredArticle.publishedAt}</span>
          </div>
        </Link>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                active
                  ? "border-primary bg-primary text-black"
                  : "border-primary-darker bg-surface text-primary-dark hover:border-primary hover:text-primary"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {!isLoading && !hasError && filteredArticles.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-primary">{selectedCategory}</h2>
          <p className="text-xs text-primary-dark">
            {filteredArticles.length} manchete{filteredArticles.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-sm text-primary-dark">Carregando notícias...</p>
        ) : hasError ? (
          <p className="text-sm text-primary-dark">Não foi possível carregar as notícias agora.</p>
        ) : filteredArticles.length === 0 ? (
          <p className="text-sm text-primary-dark">Nenhum artigo nesta categoria.</p>
        ) : (
          filteredArticles.map((article) => (
            <Link
              key={article.id}
              href={`/conteudo/dumanews/${article.id}`}
              className={`group flex flex-col gap-3 rounded-2xl p-4 shadow-md transition-all hover:scale-[1.01] hover:border-primary cursor-pointer sm:p-5 ${
                article.highlightedArticle
                  ? "border border-primary bg-[#22190a]"
                  : "border border-primary-darker bg-surface"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {article.category}
                </span>
                <span className="text-primary-dark">›</span>
              </div>

              {article.highlightedArticle && featuredArticle?.id !== article.id && (
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  Destaque
                </span>
              )}

              <div>
                <h3 className="text-base font-extrabold leading-snug text-text-primary transition-colors group-hover:text-primary">
                  {article.headline}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-primary-dark">
                  {article.summary}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="font-bold text-primary-dark">{article.source}</span>
                <span className="text-[#8F8A7E]">{article.publishedAt}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
