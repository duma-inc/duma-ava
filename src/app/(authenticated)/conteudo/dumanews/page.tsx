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
          setSelectedCategory((current) => (
            catalog.categories.includes(current) ? current : catalog.categories[0]
          ));
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

  const filteredArticles = useMemo(
    () => articles.filter((article) => article.category === selectedCategory),
    [articles, selectedCategory]
  );

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <h1 className="text-[22px] font-extrabold text-text-primary">
          DumaNews
        </h1>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => {
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

      {/* Articles list */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p className="text-primary-dark text-sm">Carregando notícias...</p>
        ) : hasError ? (
          <p className="text-primary-dark text-sm">Não foi possível carregar as notícias agora.</p>
        ) : filteredArticles.length === 0 ? (
          <p className="text-primary-dark text-sm">Nenhum artigo nesta categoria.</p>
        ) : (
          filteredArticles.map((art) => (
            <Link
              key={art.id}
              href={`/conteudo/dumanews/${art.id}`}
              className={`rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-md hover:border-primary hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group ${
                art.highlightedArticle
                  ? "bg-[#22190a] border border-primary"
                  : "bg-surface border border-primary-darker"
              }`}
            >
              <div className="flex items-center justify-between gap-2 text-[10px] text-primary-dark font-bold uppercase tracking-wider">
                <span>{art.source}</span>
                <span>{art.publishedAt}</span>
              </div>
              {art.highlightedArticle && (
                <span className="text-[10px] text-primary font-black uppercase tracking-[0.24em]">
                  Destaque
                </span>
              )}
              <div>
                <h3 className="text-base font-extrabold text-text-primary group-hover:text-primary transition-colors leading-snug">
                  {art.headline}
                </h3>
                <p className="text-xs text-primary-dark line-clamp-2 mt-1.5 leading-relaxed">
                  {art.summary}
                </p>
              </div>
              <span className="text-[11px] text-primary font-bold uppercase tracking-wide mt-1">
                Ler artigo completo →
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
