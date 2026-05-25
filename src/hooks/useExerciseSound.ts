import { useCallback } from 'react';

export const useExerciseSound = () => {
  const playSound = useCallback((isCorrect: boolean) => {
    try {
      const audioPath = isCorrect ? '/assets/audios/correct.wav' : '/assets/audios/wrong.wav';
      const audio = new Audio(audioPath);
      audio.play().catch((e) => console.log('Audio playback failed', e));
    } catch (e) {
      console.log('Audio play error', e);
    }
  }, []);

  const playFinalSound = useCallback(() => {
    try {
      const audio = new Audio('/assets/audios/final.wav');
      audio.play().catch((e) => console.log('Audio playback failed', e));
    } catch (e) {
      console.log('Audio play error', e);
    }
  }, []);

  return { playSound, playFinalSound };
};
