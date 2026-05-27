"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XMarkIcon, FlagIcon, LightBulbIcon, ArrowRightIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useExercises } from '@/hooks/useExercises';
import { useExerciseSound } from '@/hooks/useExerciseSound';
import ExerciseRenderer from '@/components/exercise/ExerciseRenderer';
import ReportIssueModal from '@/components/exercise/ReportIssueModal';
import { TYPE_LABELS } from '@/types/exercise';

export default function ExercicioPage({ params }: { params: Promise<{ date: string }> | { date: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = React.use(params as any) as { date: string };
  const dateStr = unwrappedParams.date;
  const dayLabel = searchParams.get('dayLabel') ?? 'Exercícios';

  const { playSound } = useExerciseSound();
  const [showTranslation, setShowTranslation] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const {
    current,
    currentIndex,
    total,
    isLast,
    answered,
    selectedAnswer,
    isCurrentCorrect,
    finished,
    retryRound,
    totalCorrect,
    totalWrong,
    pendingCorrection,
    submitAnswer,
    skipExercise,
    next,
    submitAllAttempts,
    isSubmitting,
  } = useExercises(dateStr);

  const hasNavigated = useRef(false);
  useEffect(() => {
    if (finished && !hasNavigated.current) {
      hasNavigated.current = true;
      submitAllAttempts().finally(() => {
        router.replace(
          `/exercitar/result?totalCorrect=${totalCorrect}&totalWrong=${totalWrong}&pendingCorrection=${pendingCorrection}&total=${totalCorrect + totalWrong + pendingCorrection}`
        );
      });
    }
  }, [finished, submitAllAttempts, router, totalCorrect, totalWrong, pendingCorrection]);

  function handleAnswer(answer: string) {
    const isCorrect = submitAnswer(answer);
    playSound(isCorrect);
    setShowTranslation(false);
  }

  function handleNext() {
    setShowTranslation(false);
    next();
  }

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="text-text-primary text-base">Nenhum exercício disponível.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -mt-6 -mx-4 sm:-mx-8 bg-background-dark">
      {/* Header */}
      <div className="flex flex-row items-center px-4 py-3 border-b border-surface bg-[#1C1C1C] sticky top-0 z-10 shadow-md">
        <button onClick={() => router.back()} className="mr-3 text-text-primary hover:text-primary transition-colors cursor-pointer">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 flex flex-col">
          <span className="text-text-primary text-base font-extrabold">{dayLabel}</span>
          {retryRound && (
            <span className="text-danger text-xs font-bold">| Refazendo as erradas</span>
          )}
        </div>
        <div className="flex flex-row items-center gap-3">
          <span className="text-primary-dark text-sm font-bold">
            {currentIndex + 1}/{total}
          </span>
          <button onClick={() => setShowReport(true)} className="text-primary-darker hover:text-primary transition-colors cursor-pointer">
            <FlagIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1 bg-surface w-full relative">
        <div
          className="h-full absolute left-0 top-0 transition-all duration-300 ease-out"
          style={{
            backgroundColor: retryRound ? '#F44336' : '#EDAA12',
            width: `${((currentIndex + 1) / total) * 100}%`,
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 flex flex-col max-w-3xl mx-auto w-full">
        {/* Badge tipo */}
        <div className="self-start bg-[#1C1C1C] border border-primary-darker rounded-full px-3 py-1 mb-4">
          <span className="text-primary-dark text-xs font-bold">
            {TYPE_LABELS[current.type] ?? current.type}
          </span>
        </div>

        {/* Enunciado */}
        <h2 className="text-[20px] font-extrabold text-text-primary leading-[30px] mb-2">
          {current.description}
        </h2>

        {/* Botão tradução */}
        {current.translation && (
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="flex flex-row items-center gap-1.5 mb-2 self-start text-primary-darker hover:text-primary transition-colors font-semibold text-[13px] cursor-pointer"
          >
            <GlobeAltIcon className="w-4 h-4" />
            {showTranslation ? 'Ocultar tradução' : 'Ver tradução'}
          </button>
        )}

        {/* Tradução */}
        {showTranslation && current.translation && (
          <div className="bg-[#1C1C1C] rounded-xl border border-primary-darker/40 p-3 mb-4">
            <span className="text-primary-dark text-sm italic">{current.translation}</span>
          </div>
        )}

        <div className="h-4" />

        {/* Render do exercício */}
        <ExerciseRenderer
          exercise={current}
          answered={answered}
          isCorrect={isCurrentCorrect}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
        />

        {/* Explanation após responder */}
        {answered && current.explanation && (
          <div className="bg-[#1A2D3D] border border-[#2A6090] rounded-xl p-3.5 mt-4 flex flex-row gap-2.5">
            <LightBulbIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div className="flex flex-col flex-1">
              <span className="text-primary font-bold text-[13px] mb-1">Explicação</span>
              <span className="text-text-primary text-sm leading-[20px]">{current.explanation}</span>
            </div>
          </div>
        )}
      </div>

      {/* Botão Próximo */}
      <div className="border-t border-surface bg-[#1C1C1C] p-4 sm:px-8 mt-auto sticky bottom-0">
        <button
          onClick={handleNext}
          disabled={!answered || isSubmitting}
          className={`w-full max-w-3xl mx-auto py-4 rounded-xl flex flex-row items-center justify-center gap-2 border-[1.5px] transition-all font-extrabold text-base ${
            answered
              ? 'bg-primary border-primary-dark text-black hover:brightness-110 active:scale-[0.98] cursor-pointer'
              : 'bg-[#1C1C1C] border-[#1C1C1C] text-[#3A3A3A] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            'Enviando...'
          ) : (
            <>
              {isLast ? 'Finalizar' : 'Próximo'}
              <ArrowRightIcon className={`w-4 h-4 ${answered ? 'text-black' : 'text-[#3A3A3A]'}`} />
            </>
          )}
        </button>
      </div>

      <ReportIssueModal
        visible={showReport}
        exerciseId={current.id}
        onClose={() => setShowReport(false)}
        onReported={() => {
          setShowReport(false);
          skipExercise();
        }}
      />
    </div>
  );
}
