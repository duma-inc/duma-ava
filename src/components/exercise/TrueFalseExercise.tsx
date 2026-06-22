import React, { useMemo } from 'react';
import { Exercise } from '../../types/exercise';
import { shuffleItems } from '../../lib/shuffle';

interface Props {
  exercise: Exercise;
  answered: boolean;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function TrueFalseExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const options = useMemo(
    () => shuffleItems(exercise.options ?? []),
    [exercise.options],
  );

  function getBtnClass(opt: { text: string; isCorrect: boolean }) {
    if (!answered) return 'bg-surface border-primary-darker hover:bg-primary-darker/20';
    if (opt.text === selectedAnswer) {
      return opt.isCorrect ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]';
    }
    if (opt.isCorrect) return 'bg-[#1A3D1A] border-[#4CAF50]';
    return 'bg-surface border-primary-darker opacity-60';
  }

  function getTextColor(opt: { text: string; isCorrect: boolean }) {
    if (!answered) return 'text-text-primary';
    if (opt.text === selectedAnswer) return opt.isCorrect ? 'text-[#4CAF50]' : 'text-[#F44336]';
    if (opt.isCorrect) return 'text-[#4CAF50]';
    return 'text-primary-darker';
  }

  return (
    <div className="flex flex-row gap-4">
      {options.map((option) => (
        <button
          key={option.optionId || option.text}
          disabled={answered}
          onClick={() => onAnswer(option.text)}
          className={`flex flex-col flex-1 items-center justify-center border-[1.5px] rounded-xl py-6 gap-2 transition-colors cursor-pointer disabled:cursor-default ${getBtnClass(option)}`}
        >
          <span className="text-3xl">
            {option.text.toLowerCase().includes('verdadeiro') || option.text.toLowerCase() === 'true' ? '✔️' : '❌'}
          </span>
          <span className={`text-base font-bold ${getTextColor(option)}`}>
            {option.text}
          </span>
        </button>
      ))}
    </div>
  );
}
