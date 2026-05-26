"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowPathIcon,
  CheckIcon,
  ChevronLeftIcon,
  TrophyIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { dumaQuizPacks, sentenceBuilderPacks } from "@/mocks/games";
import { DumaQuizQuestion } from "@/types/game";

interface PageProps {
  params: Promise<{ id: string; packId: string }>;
}

function shuffleWords(sentence: string) {
  return sentence.split(" ").sort(() => Math.random() - 0.5);
}

export default function GameExecutionPage({ params }: PageProps) {
  const { id, packId } = use(params);

  if (id === "sentence-builder") {
    return <SentenceBuilderPackPage packId={packId} />;
  }

  if (id === "duma-quiz") {
    return <DumaQuizPackPage packId={packId} />;
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h2 className="text-xl font-bold text-primary">Game não encontrado</h2>
      <Link href="/conteudo/games" className="text-sm text-primary hover:underline">
        Voltar para games
      </Link>
    </div>
  );
}

function SentenceBuilderPackPage({ packId }: { packId: string }) {
  const pack = useMemo(
    () => sentenceBuilderPacks.find((item) => item.id === packId),
    [packId]
  );
  const sentences = pack?.sentences ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const currentSentence = sentences[currentIdx];

  if (!pack || sentences.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Pacote não encontrado</h2>
        <Link href="/conteudo/games/sentence-builder" className="text-sm text-primary hover:underline">
          Voltar para packs
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          <TrophyIcon className="h-10 w-10" />
        </div>
        <div>
          <h2 className="mb-2 text-2xl font-black text-primary">Pacote Concluído!</h2>
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-primary-dark">
            {pack.weekLabel} · {pack.title}
          </p>
          <p className="mb-6 text-sm leading-relaxed text-text-primary">
            Você montou <strong className="font-bold text-primary">{score}</strong> de{" "}
            <strong className="font-bold text-primary">{sentences.length}</strong> frases corretamente.
          </p>
          <Link
            href="/conteudo/games/sentence-builder"
            className="block rounded-xl bg-primary py-3 text-sm font-extrabold text-black transition-all hover:brightness-110"
          >
            Voltar aos packs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/conteudo/games/sentence-builder"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <span className="text-xs font-extrabold uppercase text-primary-dark">
          {pack.title} · {pack.weekLabel}
        </span>
        <span className="text-xs font-extrabold text-primary">
          Frase {currentIdx + 1}/{sentences.length}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full border border-primary-darker/50 bg-surface">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / sentences.length) * 100}%` }}
        />
      </div>

      <SentenceBuilderRound
        key={currentSentence.id}
        sentenceId={currentSentence.id}
        prompt={currentSentence.prompt}
        sentence={currentSentence.sentence}
        isLast={currentIdx + 1 === sentences.length}
        onCorrect={() => setScore((prev) => prev + 1)}
        onNext={() => {
          if (currentIdx + 1 < sentences.length) {
            setCurrentIdx((prev) => prev + 1);
            return;
          }

          setIsFinished(true);
        }}
      />
    </div>
  );
}

function SentenceBuilderRound({
  sentenceId,
  prompt,
  sentence,
  isLast,
  onCorrect,
  onNext,
}: {
  sentenceId: string;
  prompt: string;
  sentence: string;
  isLast: boolean;
  onCorrect: () => void;
  onNext: () => void;
}) {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>(() => shuffleWords(sentence));
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAwardedPoint, setHasAwardedPoint] = useState(false);

  const handleWordSelect = (word: string, index: number) => {
    if (isChecked) return;
    setSelectedWords((prev) => [...prev, word]);
    setWordBank((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleWordDeselect = (word: string, index: number) => {
    if (isChecked) return;
    setSelectedWords((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    setWordBank((prev) => [...prev, word]);
  };

  const handleCheck = () => {
    if (selectedWords.length === 0) return;
    const correct = selectedWords.join(" ") === sentence;
    setIsCorrect(correct);
    setIsChecked(true);

    if (correct && !hasAwardedPoint) {
      onCorrect();
      setHasAwardedPoint(true);
    }
  };

  const handleReset = () => {
    setWordBank(shuffleWords(sentence));
    setSelectedWords([]);
    setIsChecked(false);
    setIsCorrect(false);
  };

  return (
    <>
      <div className="flex flex-col gap-5 rounded-2xl border border-primary-darker bg-surface p-5 shadow-lg sm:p-6">
        <div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
            Instrução
          </span>
          <p className="mt-2 text-[15px] font-bold text-text-primary">{prompt}</p>
        </div>

        <div className="relative flex min-h-[90px] flex-wrap content-center items-center justify-center gap-2 rounded-xl border border-primary-darker/60 bg-background p-3">
          {selectedWords.length === 0 ? (
            <span className="text-xs font-medium italic text-primary-dark">
              Selecione as palavras abaixo...
            </span>
          ) : (
            selectedWords.map((word, index) => (
              <button
                key={`${sentenceId}-${word}-${index}`}
                type="button"
                disabled={isChecked}
                onClick={() => handleWordDeselect(word, index)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition-all ${
                  isChecked
                    ? isCorrect
                      ? "cursor-default border-success bg-success/10 text-success"
                      : "cursor-default border-danger bg-danger/10 text-danger"
                    : "cursor-pointer border-primary bg-primary text-black hover:brightness-110"
                }`}
              >
                {word}
              </button>
            ))
          )}
        </div>

        {isChecked && (
          <div
            className={`flex items-center gap-3 rounded-xl border p-3.5 ${
              isCorrect
                ? "border-success bg-success/15 text-success"
                : "border-danger bg-danger/15 text-danger"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckIcon className="h-5 w-5 shrink-0" />
                <span className="text-xs font-bold">Excelente! A resposta está correta.</span>
              </>
            ) : (
              <>
                <XMarkIcon className="h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold">Frase incorreta. Tente de novo!</p>
                  <p className="mt-0.5 truncate text-[11px] opacity-80">Correto: {sentence}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex min-h-[50px] flex-wrap items-center justify-center gap-2 py-2">
          {wordBank.map((word, index) => (
            <button
              key={`${sentenceId}-${word}-bank-${index}`}
              type="button"
              disabled={isChecked}
              onClick={() => handleWordSelect(word, index)}
              className="cursor-pointer rounded-lg border border-primary-darker/60 bg-background px-3 py-1.5 text-sm font-bold text-text-primary transition-all hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {isChecked ? (
          <>
            {!isCorrect && (
              <button
                type="button"
                onClick={handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary py-3 text-xs font-extrabold text-primary transition-all hover:bg-primary/10"
              >
                <ArrowPathIcon className="h-4 w-4" />
                Tentar de Novo
              </button>
            )}
            <button
              type="button"
              onClick={onNext}
              className="flex-1 rounded-xl bg-primary py-3 text-xs font-extrabold text-black transition-all hover:brightness-110"
            >
              {isLast ? "Ver Resultados" : "Próxima Frase"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="w-full rounded-xl bg-primary py-3 text-xs font-extrabold text-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Verificar Resposta
          </button>
        )}
      </div>
    </>
  );
}

function DumaQuizPackPage({ packId }: { packId: string }) {
  const pack = useMemo(() => dumaQuizPacks.find((item) => item.id === packId), [packId]);
  const questions: DumaQuizQuestion[] = pack?.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "feedback" | "finished">("playing");
  const currentQuestion = questions[currentIndex];

  if (!pack || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <h2 className="text-xl font-bold text-primary">Pacote não encontrado</h2>
        <Link href="/conteudo/games/duma-quiz" className="text-sm text-primary hover:underline">
          Voltar para packs
        </Link>
      </div>
    );
  }

  if (phase === "finished") {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-6xl">{percentage === 100 ? "🏆" : percentage >= 70 ? "🥈" : "🥉"}</div>
        <div>
          <h2 className="mb-2 text-3xl font-black text-text-primary">Quiz concluído!</h2>
          <p className="mb-6 text-sm text-[#A08060]">{pack.title}</p>
        </div>

        <div className="w-full space-y-4 rounded-[20px] border border-primary-dark bg-surface p-6 text-left">
          <ResultRow label="Acertos" value={`${score} / ${questions.length}`} />
          <ResultRow label="Aproveitamento" value={`${percentage}%`} highlight={percentage >= 70} />
        </div>

        <Link
          href="/conteudo/games/duma-quiz"
          className="rounded-xl bg-primary-dark px-8 py-3 font-extrabold text-black transition-all hover:brightness-110"
        >
          Voltar aos packs
        </Link>
      </div>
    );
  }

  const handleAnswer = (optionIndex: number) => {
    if (phase !== "playing") return;
    setSelectedIndex(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setScore((prev) => prev + 1);
    }
    setPhase("feedback");
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      setPhase("finished");
      return;
    }

    setCurrentIndex(nextIndex);
    setSelectedIndex(null);
    setPhase("playing");
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/conteudo/games/duma-quiz"
          className="rounded-lg border border-primary-darker bg-surface p-2 text-primary transition-all hover:border-primary"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <span className="text-sm text-[#A08060]">{pack.weekLabel}</span>
        <span className="text-xs font-bold text-primary-dark">
          Pergunta {currentIndex + 1} de {questions.length}
        </span>
      </div>

      <div className="rounded-[20px] border border-primary-darker bg-surface p-6">
        <h1 className="text-center text-2xl font-bold leading-9 text-text-primary">
          {currentQuestion.question}
        </h1>
      </div>

      <div className="space-y-3">
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctIndex;
          const isSelected = index === selectedIndex;
          const feedbackClass =
            phase === "feedback"
              ? isCorrect
                ? "border-success bg-success/15"
                : isSelected
                  ? "border-danger bg-danger/15"
                  : "border-primary-darker"
              : "border-primary-darker hover:border-primary-dark";

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleAnswer(index)}
              disabled={phase !== "playing"}
              className={`flex w-full items-center gap-4 rounded-2xl border bg-surface p-4 text-left transition-all ${feedbackClass}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/5 text-sm font-extrabold text-[#A08060]">
                {String.fromCharCode(65 + index)}
              </div>
              <span className="flex-1 text-sm leading-6 text-text-primary">{option}</span>
              {phase === "feedback" && isCorrect && <CheckIcon className="h-5 w-5 text-success" />}
              {phase === "feedback" && isSelected && !isCorrect && <XMarkIcon className="h-5 w-5 text-danger" />}
            </button>
          );
        })}
      </div>

      {phase === "feedback" && (
        <div className="flex flex-col items-center gap-4">
          <p
            className={`text-base font-bold ${
              selectedIndex === currentQuestion.correctIndex ? "text-success" : "text-danger"
            }`}
          >
            {selectedIndex === currentQuestion.correctIndex ? "✓ Correto!" : "✗ Incorreto!"}
          </p>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-xl bg-primary-dark px-8 py-3 font-extrabold text-black transition-all hover:brightness-110"
          >
            {currentIndex + 1 < questions.length ? "Próxima →" : "Ver resultado"}
          </button>
        </div>
      )}
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-[#A08060]">{label}</span>
      <span className={`text-base font-bold ${highlight ? "text-success" : "text-text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
