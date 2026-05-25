import React, { useState } from 'react';
import { Exercise } from '../../types/exercise';
import { SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Props {
  exercise: Exercise;
  answered: boolean;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function ShortAnswerExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const [input, setInput] = useState('');

  return (
    <div className="flex flex-col gap-4">
      {/* Badge: será corrigido pela IA */}
      <div className="flex flex-row items-center bg-surface border border-primary-darker rounded-xl p-3 gap-2.5">
        <SparklesIcon className="w-5 h-5 text-primary" />
        <span className="text-primary-dark text-xs font-semibold flex-1">
          Este exercício será corrigido pela IA após o envio.
        </span>
      </div>

      <textarea
        value={answered ? (selectedAnswer ?? '') : input}
        onChange={(e) => setInput(e.target.value)}
        disabled={answered}
        placeholder="Digite sua resposta..."
        autoCapitalize="none"
        autoCorrect="off"
        rows={4}
        className="bg-surface border-[1.5px] rounded-xl py-4 px-5 text-base text-text-primary outline-none focus:border-primary placeholder-primary-darker/60 transition-colors resize-none disabled:border-primary disabled:opacity-90"
        style={{ borderColor: answered ? '#FDA91E' : '#7A4A12' }}
      />

      {!answered && (
        <button
          onClick={() => {
            if (input.trim()) onAnswer(input.trim());
          }}
          disabled={!input.trim()}
          className={`rounded-xl py-3.5 flex flex-row items-center justify-center font-extrabold text-base transition-all ${
            input.trim()
              ? 'bg-primary border border-primary-dark text-black hover:brightness-110 active:scale-[0.98]'
              : 'bg-surface border border-surface text-[#3A3A3A] cursor-not-allowed'
          }`}
        >
          Confirmar
        </button>
      )}

      {answered && (
        <div className="bg-[#1A2D3D] border-[1.5px] border-primary rounded-xl p-3.5 flex flex-row items-center gap-2.5">
          <ClockIcon className="w-5 h-5 text-primary" />
          <span className="text-text-primary font-semibold text-sm flex-1">
            Resposta enviada! Aguarde correção.
          </span>
        </div>
      )}
    </div>
  );
}
