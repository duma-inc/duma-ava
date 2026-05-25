"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { fetchLessonBooks } from "@/services/lessonBookService";
import { LessonBook } from "@/types/lesson";

export default function ApostilaPage() {
  const [lessonBooks, setLessonBooks] = useState<LessonBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadLessonBooks() {
      setIsLoading(true);
      setHasError(false);

      try {
        const data = await fetchLessonBooks();
        if (!isMounted) return;
        setLessonBooks(data);
      } catch {
        if (!isMounted) return;
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadLessonBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  const books = useMemo(() => lessonBooks, [lessonBooks]);

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
          Apostila
        </h1>
      </div>

      <div className="flex flex-col gap-6">
        {isLoading ? (
          <p className="text-primary-dark text-sm">Carregando apostilas...</p>
        ) : hasError ? (
          <p className="text-primary-dark text-sm">Não foi possível carregar as apostilas agora.</p>
        ) : books.length === 0 ? (
          <p className="text-primary-dark text-sm">Nenhuma apostila disponível.</p>
        ) : books.map((book) => (
          <div
            key={book.id}
            className="bg-surface rounded-2xl border border-primary-darker p-5 sm:p-6 shadow-md flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                <BookOpenIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-text-primary truncate">{book.title}</h2>
                {book.subtitle && (
                  <p className="text-xs text-primary-dark mt-1 line-clamp-2 leading-relaxed">
                    {book.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-2 border-t border-primary-darker/30 pt-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Capítulos
              </span>
              <div className="flex flex-col gap-2">
                {book.chapters.map((ch) => (
                  <Link
                    key={ch.id}
                    href={`/conteudo/apostila/${book.id}/${ch.id}`}
                    className="flex items-center gap-3 p-3 bg-[#1C1C1C] hover:bg-primary-darker/10 rounded-xl border border-primary-darker/50 hover:border-primary transition-all cursor-pointer group"
                  >
                    <BookOpenIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                        {ch.title}
                      </h4>
                      <p className="text-xs text-primary-dark line-clamp-1 mt-0.5 leading-relaxed">
                        {ch.summary}
                      </p>
                    </div>
                    <span className="text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Ler →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
