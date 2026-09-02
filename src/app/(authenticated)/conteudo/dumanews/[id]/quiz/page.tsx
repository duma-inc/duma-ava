"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { fetchNewsArticleById } from "@/services/newsService";
import { NewsArticle } from "@/types/news";

interface PageProps {
  params: Promise<{ id: string }>;
}

const LETTERS = ["A", "B", "C", "D"];

export default function NewsQuizPage({ params }: PageProps) {
  const { id } = use(params);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

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

  const backHref = `/conteudo/dumanews/${id}`;

  if (isLoading) {
    return <p className="text-sm text-primary-dark">Carregando questões...</p>;
  }

  if (hasError || !article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Não foi possível carregar o teste</h2>
        <Link href={backHref} className="text-sm text-primary hover:underline">
          Voltar para a matéria
        </Link>
      </div>
    );
  }

  const questions = article.questions ?? [];
  const total = questions.length;

  // O botao que leva ate aqui so aparece com questoes, mas a URL e acessivel direto.
  if (total === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Esta matéria ainda não tem questões</h2>
        <Link href={backHref} className="text-sm text-primary hover:underline">
          Voltar para a matéria
        </Link>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / total) * 100);
    const emoji = percentage >= 90 ? "🏆" : percentage >= 70 ? "🎉" : percentage >= 50 ? "💪" : "📚";
    const message =
      percentage >= 90 ? "Excelente compreensão!"
        : percentage >= 70 ? "Muito bem!"
        : percentage >= 50 ? "Bom progresso!"
        : "Releia a matéria com calma.";
    const tone =
      percentage >= 70 ? "text-success" : percentage >= 50 ? "text-primary" : "text-danger";

    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-8">
        <div className="flex flex-col items-center">
          <span className="text-6xl leading-none">{emoji}</span>
          <span className={`mt-3 text-5xl font-black tracking-tighter ${tone}`}>{percentage}%</span>
          <span className="mt-2 text-center text-xl font-extrabold text-text-primary">{message}</span>
          <span className="mt-1 text-center text-sm text-primary-dark">{article.headline}</span>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-primary-darker bg-surface p-5">
          <ResultRow label="Acertos" value={score} tone="text-success" />
          <ResultRow label="Erros" value={total - score} tone="text-danger" />
          <ResultRow label="Total de questões" value={total} tone="text-text-primary" />
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedIndex(null);
              setScore(0);
              setIsFinished(false);
            }}
            className="w-full cursor-pointer rounded-xl bg-primary py-4 text-sm font-extrabold text-text-on-primary transition-opacity hover:opacity-90"
          >
            Refazer o teste
          </button>
          <Link
            href={backHref}
            className="w-full rounded-xl border border-primary-darker py-4 text-center text-sm font-extrabold text-primary transition-colors hover:border-primary"
          >
            Voltar à matéria
          </Link>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isAnswered = selectedIndex !== null;
  const isCorrect = selectedIndex === question.correctIndex;
  const isLast = currentIndex + 1 >= total;

  function handleAnswer(optionIndex: number) {
    if (isAnswered) return;

    setSelectedIndex(optionIndex);
    if (optionIndex === question.correctIndex) {
      setScore((previous) => previous + 1);
    }
  }

  function handleNext() {
    if (isLast) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((previous) => previous + 1);
    setSelectedIndex(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <span className="truncate text-sm text-primary-dark">{article.headline}</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-primary-dark">
          Questão {currentIndex + 1} de {total}
        </span>
        <div className="h-1 w-full rounded-full bg-primary-darker/40">
          <div
            className="h-1 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-primary-darker bg-[#1C1C1C] p-5 shadow-md sm:p-7">
        <p className="text-lg font-bold leading-snug text-text-primary">{question.question}</p>

        <div className="flex flex-col gap-2">
          {question.options.map((option, optionIndex) => {
            const isPicked = selectedIndex === optionIndex;
            const isAnswer = question.correctIndex === optionIndex;

            // Depois de responder, a certa aparece mesmo que o aluno tenha errado.
            let tone = "border-primary-darker bg-surface text-text-primary";
            if (isAnswered && isAnswer) {
              tone = "border-success bg-success/10 text-text-primary";
            } else if (isAnswered && isPicked) {
              tone = "border-danger bg-danger/10 text-text-primary";
            } else if (isAnswered) {
              tone = "border-primary-darker/40 bg-surface text-text-primary/50";
            }

            return (
              <button
                key={`${question.id}-${optionIndex}`}
                type="button"
                disabled={isAnswered}
                onClick={() => handleAnswer(optionIndex)}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${tone} ${
                  isAnswered ? "cursor-default" : "cursor-pointer hover:border-primary"
                }`}
              >
                <span className="font-extrabold text-primary">
                  {LETTERS[optionIndex] ?? optionIndex + 1}
                </span>
                <span className="flex-1">{option}</span>
                {isAnswered && isAnswer && (
                  <CheckCircleIcon className="h-5 w-5 shrink-0 text-success" />
                )}
                {isAnswered && isPicked && !isAnswer && (
                  <XCircleIcon className="h-5 w-5 shrink-0 text-danger" />
                )}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="rounded-xl border border-primary-darker/40 bg-background/40 px-4 py-3">
            <p
              className={`text-xs font-extrabold uppercase tracking-wide ${
                isCorrect ? "text-success" : "text-danger"
              }`}
            >
              {isCorrect ? "Correto" : "Incorreto"}
            </p>
            {question.explanation && (
              <p className="mt-1 text-sm leading-6 text-text-primary/90">{question.explanation}</p>
            )}
          </div>
        )}
      </div>

      {isAnswered && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full cursor-pointer rounded-xl bg-primary py-4 text-sm font-extrabold text-text-on-primary transition-opacity hover:opacity-90"
        >
          {isLast ? "Ver resultado" : "Próxima questão"}
        </button>
      )}
    </div>
  );
}

function ResultRow({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-primary-dark">{label}</span>
      <span className={`text-lg font-extrabold ${tone}`}>{value}</span>
    </div>
  );
}
