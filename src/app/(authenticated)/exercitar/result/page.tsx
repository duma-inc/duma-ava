"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckIcon, XMarkIcon, ClockIcon, SparklesIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

function ResultContent() {
  const searchParams = useSearchParams();
  
  const totalCorrect = parseInt(searchParams.get('totalCorrect') ?? '0', 10);
  const totalWrong = parseInt(searchParams.get('totalWrong') ?? '0', 10);
  const pendingCorrection = parseInt(searchParams.get('pendingCorrection') ?? '0', 10);
  const total = parseInt(searchParams.get('total') ?? '0', 10);

  const scorePercentage = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;

  function getScoreColor() {
    if (scorePercentage >= 80) return 'text-[#4CAF50]';
    if (scorePercentage >= 50) return 'text-primary';
    return 'text-danger';
  }

  function getScoreEmoji() {
    if (scorePercentage >= 90) return '🏆';
    if (scorePercentage >= 70) return '🎉';
    if (scorePercentage >= 50) return '💪';
    return '📚';
  }

  function getScoreMessage() {
    if (scorePercentage >= 90) return 'Excelente trabalho!';
    if (scorePercentage >= 70) return 'Muito bem!';
    if (scorePercentage >= 50) return 'Bom progresso!';
    return 'Continue praticando!';
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 max-w-lg mx-auto w-full min-h-[calc(100vh-140px)]">
      {/* Emoji */}
      <span className="text-[64px] mb-4 leading-none">{getScoreEmoji()}</span>

      {/* Score */}
      <span className={`text-[56px] font-black mb-2 leading-none tracking-tighter ${getScoreColor()}`}>
        {scorePercentage}%
      </span>

      <span className="text-[22px] font-extrabold text-text-primary mb-8 text-center">
        {getScoreMessage()}
      </span>

      {/* Stats */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-5 w-full flex flex-col gap-4">
        {/* Acertos */}
        <div className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A3D1A] flex items-center justify-center shrink-0">
            <CheckIcon className="w-5 h-5 text-[#4CAF50]" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-[#4CAF50] text-lg font-extrabold">{totalCorrect}</span>
            <span className="text-primary-darker text-xs font-semibold">Acertos</span>
          </div>
        </div>

        {/* Erros */}
        <div className="flex flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#3D1A1A] flex items-center justify-center shrink-0">
            <XMarkIcon className="w-5 h-5 text-danger" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-danger text-lg font-extrabold">{totalWrong}</span>
            <span className="text-primary-darker text-xs font-semibold">Erros (refeitos até acertar)</span>
          </div>
        </div>

        {/* Pendentes */}
        {pendingCorrection > 0 && (
          <div className="flex flex-row items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A2D3D] flex items-center justify-center shrink-0">
              <ClockIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-primary text-lg font-extrabold">{pendingCorrection}</span>
              <span className="text-primary-darker text-xs font-semibold">Em correção pela IA</span>
            </div>
          </div>
        )}
      </div>

      {/* Mensagem de correção pendente */}
      {pendingCorrection > 0 && (
        <div className="bg-[#1A2D3D] border border-[#2A6090] rounded-xl p-3.5 mt-4 w-full flex flex-row gap-2.5">
          <SparklesIcon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <span className="text-text-primary text-[13px] leading-[18px] flex-1">
            {pendingCorrection} exercício{pendingCorrection > 1 ? 's' : ''} ainda {pendingCorrection > 1 ? 'estão' : 'está'} em correção pela IA. O resultado será atualizado quando a correção for concluída.
          </span>
        </div>
      )}

      {/* Botão voltar */}
      <Link
        href="/dashboard"
        className="mt-8 w-full py-4 rounded-xl flex flex-row items-center justify-center gap-2 bg-primary border-[1.5px] border-primary-dark text-black font-extrabold text-base hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <HomeIcon className="w-5 h-5 text-black" />
        Voltar ao início
      </Link>
    </div>
  );
}

export default function ExerciseResultPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-primary-dark">Calculando resultado...</span>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
