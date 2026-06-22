import React, { useMemo } from 'react';
import { Exercise } from '../../types/exercise';
import { shuffleItems } from '../../lib/shuffle';

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function MultipleChoiceExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const options = useMemo(
    () => shuffleItems(exercise.options ?? []),
    [exercise.options],
  );

  function getOptionClass(opt: { text: string; isCorrect: boolean }) {
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
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <button
          key={option.optionId || option.text}
          disabled={answered}
          onClick={() => onAnswer(option.text)}
          className={`flex flex-row items-center justify-between border-[1.5px] rounded-xl px-5 py-4 transition-colors cursor-pointer disabled:cursor-default ${getOptionClass(option)}`}
        >
          <span className={`text-base font-semibold text-left flex-1 ${getTextColor(option)}`}>
            {option.text}
          </span>
          {answered && option.text === selectedAnswer && (
            <span className="text-lg ml-2 font-bold">{option.isCorrect ? '✓' : '✗'}</span>
          )}
          {answered && option.isCorrect && option.text !== selectedAnswer && (
            <span className="text-lg text-[#4CAF50] ml-2 font-bold">✓</span>
          )}
        </button>
      ))}
    </div>
  );
}
