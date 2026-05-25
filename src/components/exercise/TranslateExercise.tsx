import React, { useState, useEffect } from 'react';
import { Exercise } from '../../types/exercise';
import { LanguageIcon } from '@heroicons/react/24/outline';

interface Props {
  exercise: Exercise;
  answered: boolean;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function TranslateExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput('');
  }, [exercise.id]);

  // Is correct can be derived from the selected answer if it's correct according to options
  const isCorrect = answered && exercise.options.some((o) => o.isCorrect && o.text.toLowerCase() === selectedAnswer?.toLowerCase());

  return (
    <div className="flex flex-col gap-5">
      {/* Card da frase/palavra */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-6 flex flex-col items-center gap-2">
        <LanguageIcon className="w-7 h-7 text-primary" />
        <p className="text-[22px] font-black text-text-primary text-center">
          {exercise.description}
        </p>
        <p className="text-[13px] text-primary-darker">Traduza para o inglês</p>
      </div>

      {!answered && (
        <>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Sua tradução..."
            autoCapitalize="none"
            autoCorrect="off"
            className="bg-surface border-[1.5px] border-primary-darker rounded-xl py-3.5 px-4 text-base text-text-primary outline-none focus:border-primary placeholder-primary-darker/60 transition-colors"
          />
          <button
            onClick={() => {
              if (input.trim()) onAnswer(input.trim());
            }}
            className="bg-primary border border-primary-dark rounded-xl py-3.5 text-black font-extrabold text-base hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Confirmar tradução
          </button>
        </>
      )}

      {answered && (
        <div
          className={`border-[1.5px] rounded-xl p-3.5 flex flex-col gap-1.5 ${
            isCorrect ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]'
          }`}
        >
          <p className={`font-bold text-sm ${isCorrect ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
            {isCorrect ? '✓ Tradução correta!' : '✗ Tradução incorreta'}
          </p>
          <p className="text-[#D88A00] text-sm">
            Sua resposta:{' '}
            <span className="text-text-primary font-semibold">{selectedAnswer}</span>
          </p>
        </div>
      )}
    </div>
  );
}
