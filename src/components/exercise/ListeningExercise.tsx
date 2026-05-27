import React, { useEffect, useState } from 'react';
import { SpeakerWaveIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { Exercise } from '../../types/exercise';

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function ListeningExercise({ exercise, answered, selectedAnswer, onAnswer }: Props) {
  const options = exercise.options ?? [];

  const [isPlaying, setIsPlaying] = useState(false);
  const [prevExerciseId, setPrevExerciseId] = useState(exercise.id);

  // Sync state on exercise change during render
  if (exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setIsPlaying(false);
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Safe catch
        }
      }
    };
  }, [exercise.id]);

  const togglePlayback = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    try {
      if (isPlaying || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(exercise.description);
        utterance.lang = exercise.language || 'en-US';
        utterance.pitch = 0.95;
        utterance.rate = 0.9;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn('Error toggling speech synthesis:', err);
      setIsPlaying(false);
    }
  };

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
    <div className="flex flex-col gap-4">
      {/* Box de Execução do Áudio */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-[#7A4A12] p-6 flex flex-col items-center gap-3 text-center shadow-md">
        <SpeakerWaveIcon className="w-8 h-8 text-[#FDA91E]" />
        <span className="text-xs text-[#D88A00] font-bold uppercase tracking-wider">
          Ouça e responda:
        </span>

        <button
          type="button"
          onClick={togglePlayback}
          className="flex flex-row items-center gap-2 bg-[#2D2013] border-[1.5px] border-[#FDA91E] hover:brightness-110 active:scale-[0.98] rounded-full py-3 px-6 mt-2 transition-all cursor-pointer font-bold text-sm text-[#FDA91E] select-none"
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-5 h-5" />
              <span>Pausar Áudio</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-5 h-5" />
              <span>Ouvir Áudio</span>
            </>
          )}
        </button>
      </div>

      {/* Opções de Resposta */}
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
    </div>
  );
}
