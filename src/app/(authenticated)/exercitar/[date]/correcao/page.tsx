"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { useCorrectionContext } from '@/store/CorrectionContext';
import { CorrectionEntry } from '@/types/correction';

const EXERCISE_TYPE_LABELS: Record<string, string> = {
  SHORT_ANSWER: 'Resposta curta',
  ESSAY: 'Dissertativa',
};

function EntryCard({ entry }: { entry: CorrectionEntry }) {
  const correct = entry.isCorrect === true;
  const accent =
    entry.isCorrect == null ? 'text-primary-dark' : correct ? 'text-success' : 'text-danger';

  return (
    <div className="bg-surface rounded-xl p-4 border border-primary-darker shadow-sm">
      <div className="flex flex-row items-center gap-2 mb-2">
        {entry.isCorrect == null ? (
          <QuestionMarkCircleIcon className={`w-5 h-5 ${accent}`} />
        ) : correct ? (
          <CheckCircleIcon className={`w-5 h-5 ${accent}`} />
        ) : (
          <XCircleIcon className={`w-5 h-5 ${accent}`} />
        )}
        <span className="flex-1 text-[13px] font-bold text-text-primary">
          {EXERCISE_TYPE_LABELS[entry.exerciseType ?? ''] ?? entry.exerciseType ?? 'Exercício'}
        </span>
        {entry.score != null && (
          <span className={`text-[13px] font-extrabold ${accent}`}>{entry.score}/100</span>
        )}
      </div>

      {entry.exerciseDescription ? (
        <div className="mb-2">
          <p className="text-[11px] font-bold text-primary-dark mb-0.5">Exercício</p>
          <p className="text-[13px] text-text-primary leading-snug">{entry.exerciseDescription}</p>
        </div>
      ) : null}

      {entry.answerGiven ? (
        <div className="mb-2">
          <p className="text-[11px] font-bold text-primary-dark mb-0.5">Sua resposta</p>
          <p className="text-[13px] text-text-primary/80 leading-snug">{entry.answerGiven}</p>
        </div>
      ) : null}

      <p className="text-[11px] font-bold text-primary-dark mb-0.5">Feedback do tutor</p>
      <p className="text-[13px] text-text-primary leading-snug">
        {entry.feedback?.trim() ? entry.feedback : 'Sem comentários adicionais.'}
      </p>
    </div>
  );
}

export default function CorrecaoPage({
  params,
}: {
  params: Promise<{ date: string }> | { date: string };
}) {
  const unwrappedParams = React.use(params as any) as { date: string };
  const dateStr = unwrappedParams.date;
  const searchParams = useSearchParams();
  const dayLabel = searchParams.get('dayLabel');

  const { getCorrectionForDate, markSeen } = useCorrectionContext();
  const correction = getCorrectionForDate(dateStr);

  useEffect(() => {
    if (correction && !correction.seenByStudent) {
      markSeen(correction.id);
    }
  }, [correction, markSeen]);

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full pb-10">
      <div className="flex items-center gap-3">
        <Link
          href="/exercitar"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-text-primary truncate">
            Correção {dayLabel ? `— ${dayLabel}` : ''}
          </h1>
          {correction && (
            <p className="text-[13px] text-primary-dark mt-0.5">
              {correction.totalCorrected ?? correction.items.length} exercício(s) corrigido(s)
            </p>
          )}
        </div>
      </div>

      {!correction ? (
        <div className="flex flex-col items-center py-12 gap-3 text-center">
          <DocumentTextIcon className="w-12 h-12 text-primary-darker" />
          <span className="text-sm text-text-primary max-w-xs">
            Nenhuma correção disponível para este dia ainda.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {correction.items.map((entry) => (
            <EntryCard key={entry.attemptId} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
