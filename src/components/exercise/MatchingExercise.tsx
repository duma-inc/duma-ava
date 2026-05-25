import React, { useState } from 'react';
import { Exercise, ExerciseOption } from '../../types/exercise';
import { TrashIcon, CheckCircleIcon, LinkIcon, XCircleIcon } from '@heroicons/react/24/outline';

function resolveMatchKey(o: ExerciseOption): string | undefined {
  return o.matchKey ?? (o as any).match_key;
}

interface Props {
  exercise: Exercise;
  answered: boolean;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function MatchingExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const terms = exercise.options;
  const definitionTexts = exercise.options.map((o) => resolveMatchKey(o) ?? o.text);

  const [shuffledDefs] = useState<string[]>(() => [...definitionTexts].sort(() => Math.random() - 0.5));
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, number>>({});

  const allPaired = Object.keys(pairs).length === terms.length;

  function selectTerm(termText: string) {
    if (answered) return;
    if (selectedTerm === termText) {
      setSelectedTerm(null);
      return;
    }
    setSelectedTerm(termText);
  }

  function selectDef(defIdx: number) {
    if (answered || !selectedTerm) return;
    setPairs((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(next)) {
        if (v === defIdx) delete next[k];
      }
      delete next[selectedTerm];
      next[selectedTerm] = defIdx;
      return next;
    });
    setSelectedTerm(null);
  }

  function confirm() {
    if (!allPaired) return;
    const answer: Record<string, string> = {};
    for (const [t, idx] of Object.entries(pairs)) answer[t] = shuffledDefs[idx];
    onAnswer(JSON.stringify(answer));
  }

  function checkPairCorrect(termText: string, defIdx: number): boolean {
    const term = exercise.options.find((o) => o.text === termText);
    if (!term) return false;
    return (resolveMatchKey(term) ?? term.optionId) === shuffledDefs[defIdx];
  }

  const isCorrect = answered ? Object.entries(pairs).every(([t, d]) => checkPairCorrect(t, d)) : false;

  function getTermStyle(text: string) {
    if (answered) {
      const defIdx = pairs[text];
      const correct = defIdx !== undefined ? checkPairCorrect(text, defIdx) : false;
      return correct ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]';
    }
    if (text === selectedTerm) return 'bg-primary/20 border-primary shadow-md';
    if (pairs[text] !== undefined) return 'bg-[#1A3D1A]/30 border-[#4CAF50]/40';
    return 'bg-surface border-primary-darker hover:bg-primary-darker/10';
  }

  function getDefStyle(defIdx: number) {
    const pairedWith = Object.entries(pairs).find(([, d]) => d === defIdx);
    if (answered && pairedWith) {
      const correct = checkPairCorrect(pairedWith[0], defIdx);
      return correct ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]';
    }
    if (selectedTerm && !pairedWith) return 'bg-surface border-primary shadow-md cursor-pointer hover:bg-primary/10';
    if (pairedWith) return 'bg-[#1A3D1A]/30 border-[#4CAF50]/40';
    return 'bg-surface border-primary-darker opacity-60';
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2.5 mb-0.5">
        <span className="flex-1 text-primary-darker text-[11px] font-bold text-center tracking-wide uppercase">
          Termo
        </span>
        <span className="flex-1 text-primary-darker text-[11px] font-bold text-center tracking-wide uppercase">
          Correspondência
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {terms.map((t, idx) => {
          const defText = shuffledDefs[idx] ?? '';
          const isPaired = pairs[t.text] !== undefined;
          const isSelected = t.text === selectedTerm;
          const pairedWith = Object.entries(pairs).find(([, d]) => d === idx);
          const isAvailable = !!selectedTerm && !pairedWith;

          return (
            <div key={t.optionId || t.text} className="flex flex-row gap-2.5 items-stretch">
              {/* Term card */}
              <button
                disabled={answered}
                onClick={() => selectTerm(t.text)}
                className={`flex-1 flex flex-col items-center justify-center border-[1.5px] rounded-xl p-3 transition-all ${getTermStyle(
                  t.text
                )} ${!answered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`text-[13px] font-bold text-center leading-[18px] ${
                    isSelected ? 'text-primary' : isPaired ? 'text-[#A0C8A0]' : 'text-text-primary'
                  }`}
                >
                  {t.text}
                </span>
                {isPaired && !answered && (
                  <div className="flex flex-row items-center gap-1 mt-1">
                    <LinkIcon className="w-3 h-3 text-[#4CAF50]/60" />
                    <span className="text-[10px] text-[#4CAF50]/60 truncate max-w-[100px]">
                      {shuffledDefs[pairs[t.text]]}
                    </span>
                  </div>
                )}
              </button>

              {/* Definition card */}
              <button
                disabled={answered || !selectedTerm}
                onClick={() => selectDef(idx)}
                className={`flex-1 flex items-center justify-center border-[1.5px] rounded-xl p-3 transition-all ${getDefStyle(
                  idx
                )} ${isAvailable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`text-[13px] font-bold text-center leading-[18px] ${
                    pairedWith ? 'text-[#A0C8A0]' : 'text-text-primary'
                  }`}
                >
                  {defText}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      {!answered && (
        <div className="flex flex-row gap-2.5 items-center mt-2">
          <button
            onClick={() => {
              setPairs({});
              setSelectedTerm(null);
            }}
            className="w-[52px] h-[52px] rounded-xl border-[1.5px] border-primary-darker bg-surface flex items-center justify-center hover:bg-primary-darker/20 transition-colors"
          >
            <TrashIcon className="w-5 h-5 text-danger" />
          </button>

          <button
            onClick={confirm}
            disabled={!allPaired}
            className={`flex-1 h-[52px] rounded-xl border-[1.5px] flex flex-row items-center justify-center gap-2 font-extrabold text-[15px] transition-all ${
              allPaired
                ? 'bg-primary border-primary-dark text-black hover:brightness-110 active:scale-[0.98]'
                : 'bg-surface border-[#2A2A2A] text-[#3A3A3A] cursor-not-allowed'
            }`}
          >
            <CheckCircleIcon className={`w-5 h-5 ${allPaired ? 'text-black' : 'text-[#3A3A3A]'}`} />
            Confirmar
          </button>
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div
          className={`mt-2 border-[1.5px] rounded-xl p-3.5 flex flex-row items-center gap-2.5 ${
            isCorrect ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]'
          }`}
        >
          {isCorrect ? (
            <CheckCircleIcon className="w-6 h-6 text-[#4CAF50]" />
          ) : (
            <XCircleIcon className="w-6 h-6 text-[#F44336]" />
          )}
          <span className={`font-bold text-sm ${isCorrect ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
            {isCorrect ? 'Todas as correspondências corretas!' : 'Algumas correspondências incorretas'}
          </span>
        </div>
      )}
    </div>
  );
}
