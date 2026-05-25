"use client";

import { use, useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { fetchLessonBooks } from "@/services/lessonBookService";
import { LessonBook } from "@/types/lesson";

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>;
}

function parseMarkdownToJsx(markdown: string) {
  const lines = markdown.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      return (
        <h1 key={idx} className="text-2xl font-extrabold text-primary mt-6 mb-3">
          {trimmed.substring(2)}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={idx} className="text-xl font-bold text-text-primary mt-5 mb-2">
          {trimmed.substring(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("> ")) {
      return (
        <blockquote key={idx} className="border-l-4 border-primary bg-primary-darker/10 pl-4 py-2 my-4 italic text-primary-dark">
          {trimmed.substring(2)}
        </blockquote>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <li key={idx} className="list-disc list-inside ml-4 my-1 text-sm text-text-primary/95">
          {trimmed.substring(2)}
        </li>
      );
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <li key={idx} className="list-decimal list-inside ml-4 my-1 text-sm text-text-primary/95">
          {trimmed.replace(/^\d+\.\s/, "")}
        </li>
      );
    }
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      return (
        <div key={idx} className="relative w-full aspect-video rounded-xl overflow-hidden my-4 border border-primary-darker shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full h-full object-cover" />
        </div>
      );
    }
    if (trimmed.length === 0) {
      return <div key={idx} className="h-2" />;
    }

    // Inline bold replacement
    let content: React.ReactNode = trimmed;
    if (trimmed.includes("**")) {
      const parts = trimmed.split("**");
      content = parts.map((part, pIdx) => {
        if (pIdx % 2 !== 0) {
          return <strong key={pIdx} className="font-extrabold text-primary">{part}</strong>;
        }
        return part;
      });
    }

    return (
      <p key={idx} className="text-sm text-text-primary/90 leading-relaxed my-2">
        {content}
      </p>
    );
  });
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
    <div className="flex flex-col gap-6 pb-10 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/conteudo/apostila"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-primary-dark uppercase font-bold truncate">
            {book.title}
          </span>
          <h1 className="text-base font-extrabold text-text-primary truncate">
            {chapter.title}
          </h1>
        </div>
      </div>

      {/* Handout content block */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 sm:p-7 shadow-md">
        <div className="prose prose-invert max-w-none">
          {parseMarkdownToJsx(chapter.markdown)}
        </div>
      </div>
    </div>
  );
}
