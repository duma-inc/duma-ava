"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import LessonChapterCard from "@/components/ui/LessonChapterCard";
import { fetchLessonBooks } from "@/services/lessonBookService";
import { LessonBook } from "@/types/lesson";

export default function ApostilaPage() {
  const [lessonBooks, setLessonBooks] = useState<LessonBook[]>([]);
  const [activeLessonId, setActiveLessonId] = useState("");
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
        setActiveLessonId(data[0]?.id || "");
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

  const activeLessonIndex = useMemo(
    () => Math.max(lessonBooks.findIndex((lesson) => lesson.id === activeLessonId), 0),
    [activeLessonId, lessonBooks]
  );

  const activeLesson = useMemo(
    () => lessonBooks.find((lesson) => lesson.id === activeLessonId) || lessonBooks[0],
    [activeLessonId, lessonBooks]
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
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

      {isLoading ? (
        <p className="text-sm text-primary-dark">Carregando acervo...</p>
      ) : hasError ? (
        <p className="text-sm text-primary-dark">Não foi possível carregar as apostilas agora.</p>
      ) : !activeLesson ? (
        <p className="text-sm text-primary-dark">Nenhuma apostila disponível.</p>
      ) : (
        <>
          <div className="rounded-[18px] border border-primary-darker bg-surface p-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveLessonId(lessonBooks[activeLessonIndex - 1]?.id || activeLesson.id)}
                disabled={activeLessonIndex === 0}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary bg-primary/15 text-primary disabled:cursor-not-allowed disabled:border-[#2E2E2E] disabled:bg-[#242424] disabled:text-[#6A655A] disabled:opacity-50"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <p className="mb-1 text-xs font-bold uppercase text-[#8F8A7E]">Lesson ativa</p>
                <h2 className="truncate text-base font-extrabold text-text-primary">
                  {activeLesson.title}
                </h2>
                <p className="mt-1 text-xs text-primary-dark">
                  {activeLessonIndex + 1} de {lessonBooks.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveLessonId(lessonBooks[activeLessonIndex + 1]?.id || activeLesson.id)}
                disabled={activeLessonIndex === lessonBooks.length - 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary bg-primary/15 text-primary disabled:cursor-not-allowed disabled:border-[#2E2E2E] disabled:bg-[#242424] disabled:text-[#6A655A] disabled:opacity-50"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="rounded-[22px] border border-primary-darker bg-surface p-5 shadow-md sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="mb-2 text-2xl font-extrabold text-text-primary">
                  {activeLesson.title}
                </h2>
                {activeLesson.subtitle && (
                  <p className="text-sm leading-6 text-[#D2B98B]">{activeLesson.subtitle}</p>
                )}
              </div>

              <a
                href={activeLesson.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary bg-primary/15 text-primary transition-all hover:brightness-110"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </a>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3">
              <BookOpenIcon className="h-6 w-6 text-primary" />
              <p className="text-sm text-[#D2B98B]">
                Selecione um capítulo para ler online ou abra o PDF para imprimir e estudar fora do navegador.
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xl font-extrabold text-primary">Capítulos da apostila</h3>
            <div className="space-y-3">
              {activeLesson.chapters.map((chapter) => (
                <LessonChapterCard
                  key={chapter.id}
                  href={`/conteudo/apostila/${activeLesson.id}/${chapter.id}`}
                  order={chapter.order}
                  title={chapter.title}
                  summary={chapter.summary}
                />
              ))}
              {activeLesson.chapters.length === 0 && (
                <p className="text-sm text-primary-dark">Esta apostila ainda não possui capítulos cadastrados.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
