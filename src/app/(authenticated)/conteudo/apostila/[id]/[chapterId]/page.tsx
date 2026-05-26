"use client";

import { use, useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { fetchLessonBooks } from "@/services/lessonBookService";
import { LessonBook } from "@/types/lesson";

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

export default function ChapterViewerPage({ params }: PageProps) {
  const { id, chapterId } = use(params);
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

  const book = useMemo(() => lessonBooks.find((l) => l.id === id), [id, lessonBooks]);
  const chapter = useMemo(() => book?.chapters.find((c) => c.id === chapterId), [book, chapterId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Carregando capítulo...</h2>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Não foi possível carregar a apostila</h2>
        <Link href="/conteudo/apostila" className="text-sm text-primary hover:underline">
          Voltar para apostila
        </Link>
      </div>
    );
  }

  if (!book || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Capítulo não encontrado</h2>
        <Link href="/conteudo/apostila" className="text-sm text-primary hover:underline">
          Voltar para apostila
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/apostila"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
      </div>

      <div className="rounded-[22px] border border-primary-darker bg-surface p-5 sm:p-6">
        <p className="mb-2 text-xs font-bold uppercase text-primary-dark">{book.title}</p>
        <h1 className="text-3xl font-extrabold text-text-primary">{chapter.title}</h1>
      </div>

      <div className="rounded-[22px] border border-primary-darker bg-surface p-5 shadow-md sm:p-6">
        <MarkdownContent markdown={chapter.markdown} />
      </div>
    </div>
  );
}
