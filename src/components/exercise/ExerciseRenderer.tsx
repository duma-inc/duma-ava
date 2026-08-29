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
import OrderExercise from './OrderExercise';

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

/**
 * O `key={exercise.id}` em cada case e obrigatorio: sem ele o React reaproveita a
 * instancia entre exercicios do mesmo tipo e o estado interno (frase montada,
 * pares selecionados) vaza de um para o outro.
 */
export default function ExerciseRenderer({ exercise, answered, isCorrect, selectedAnswer, onAnswer }: Props) {
  switch (exercise.type) {
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceExercise key={exercise.id} exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'FILL_IN_THE_BLANK':
      return <FillBlankExercise key={exercise.id} exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'TRANSLATION':
      return <TranslateExercise key={exercise.id} exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'TRUE_FALSE':
      return <TrueFalseExercise key={exercise.id} exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'SHORT_ANSWER':
      return <ShortAnswerExercise key={exercise.id} exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'ESSAY':
      return <EssayExercise key={exercise.id} exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'MATCHING':
      return <MatchingExercise key={exercise.id} exercise={exercise} answered={answered} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'SPEAKING':
      return <SpeakingExercise key={exercise.id} exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'LISTENING':
      return <ListeningExercise key={exercise.id} exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    case 'ORDER':
      return <OrderExercise key={exercise.id} exercise={exercise} answered={answered} isCorrect={isCorrect} selectedAnswer={selectedAnswer} onAnswer={onAnswer} />;
    default:
      return null;
  }
}
