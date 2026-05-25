import React, { useState, useEffect } from 'react';
import { Exercise } from '../../types/exercise';

interface Props {
  exercise: Exercise;
  answered: boolean;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

function splitDescription(description: string): [string, string] {
  const parts = description.split(/_{3,}/);
  return [parts[0] ?? '', parts[1] ?? ''];
}

export default function FillBlankExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const [input, setInput] = useState('');

  useEffect(() => {
    setInput('');
  }, [exercise.id]);

  // isCorrect from options since we don't receive it directly as prop anymore (recomputed)
  const isCorrect = answered && exercise.options.some((o) => o.isCorrect && o.text.toLowerCase() === selectedAnswer?.toLowerCase());
  const [before, after] = splitDescription(exercise.description);

  return (
    <div className="flex flex-col gap-5">
      {/* Frase com lacuna */}
      <div className="bg-surface rounded-xl border border-primary-darker p-5 flex flex-row flex-wrap items-center gap-1">
        <span className="text-[17px] text-text-primary leading-[26px]">{before}</span>
        {answered ? (
          <span
            className={`text-[17px] font-extrabold border-b-2 px-1 ${
              isCorrect ? 'text-[#4CAF50] border-[#4CAF50]' : 'text-[#F44336] border-[#F44336]'
            }`}
          >
            {selectedAnswer}
          </span>
        ) : (
          <div className="border-b-2 border-primary min-w-[80px] px-1 inline-flex justify-center">
            <span className="text-[17px] text-primary">{input || '\u00A0\u00A0?\u00A0\u00A0'}</span>
          </div>
        )}
        <span className="text-[17px] text-text-primary leading-[26px]">{after}</span>
      </div>

      {/* Input */}
      {!answered && (
        <>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Complete a lacuna..."
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
            Confirmar
          </button>
        </>
      )}

      {/* Feedback */}
      {answered && (
        <div
          className={`border-[1.5px] rounded-xl p-3.5 flex flex-col gap-1 ${
            isCorrect ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]'
          }`}
        >
          <p className={`font-bold text-sm ${isCorrect ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
            {isCorrect ? '✓ Correto!' : '✗ Incorreto'}
          </p>
          {!isCorrect && (
            <p className="text-text-primary text-sm">
              Resposta aceita:{' '}
              <span className="font-bold text-primary">
                {exercise.options.filter((o) => o.isCorrect).map((o) => o.text).join(' ou ')}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
