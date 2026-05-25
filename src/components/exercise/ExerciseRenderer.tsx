import React from 'react';
import { Exercise } from '../../types/exercise';
import MultipleChoiceExercise from './MultipleChoiceExercise';
import FillBlankExercise from './FillBlankExercise';
import TranslateExercise from './TranslateExercise';
import TrueFalseExercise from './TrueFalseExercise';
import ShortAnswerExercise from './ShortAnswerExercise';
import EssayExercise from './EssayExercise';
import MatchingExercise from './MatchingExercise';
import SpeakingExercise from './SpeakingExercise';
import ListeningExercise from './ListeningExercise';

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function ExerciseRenderer({ exercise, answered, isCorrect, selectedAnswer, onAnswer }: Props) {
  switch (exercise.type) {
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceExercise exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'FILL_IN_THE_BLANK':
      return <FillBlankExercise exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'TRANSLATION':
      return <TranslateExercise exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'TRUE_FALSE':
      return <TrueFalseExercise exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'SHORT_ANSWER':
      return <ShortAnswerExercise exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'ESSAY':
      return <EssayExercise exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'MATCHING':
      return <MatchingExercise exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'SPEAKING':
      return <SpeakingExercise exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'LISTENING':
      return <ListeningExercise exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    default:
      return null;
  }
}
