export type ExerciseType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'TRANSLATION'
  | 'FILL_IN_THE_BLANK'
  | 'MATCHING'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'SPEAKING'
  | 'LISTENING';

export interface ExerciseOption {
  optionId: string;
  text: string;
  isCorrect: boolean;
  matchKey?: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  skillId: string;
  stageId?: number;
  description: string;
  translation?: string;
  explanation?: string;
  type: ExerciseType;
  difficulty: string;
  language?: string;
  status?: string;
  origin?: string;
  audioUrl?: string;
  options: ExerciseOption[];
}

export interface DailyPlanResponse {
  date: string;
  status: string;
  exercises: Exercise[];
  reinforcementExercises: Exercise[];
}

export interface WeeklyPlanResponse {
  id: string;
  studentId: string;
  skillId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalExercises: number;
  status: string;
  dailyPlans: DailyPlanResponse[];
}

export interface EnrollmentResponse {
  id: number;
  userId: string;
  skillId: number;
  currentStageId: number;
  status: string;
  progressPercentage: number;
  source: string;
  pace: string;
}

export interface AttemptPayload {
  lessonId: string;
  exerciseId: string;
  answerGiven: string;
  isCorrect: boolean;
  score: number;
  timeSpentSeconds: number;
}

export interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  answer: string;
  type: ExerciseType;
}

/** Types that are never considered wrong for retry purposes */
export const NON_RETRYABLE_TYPES: ExerciseType[] = ['ESSAY', 'TRUE_FALSE', 'SHORT_ANSWER', 'SPEAKING'];

/** Types that are never auto-corrected (always isCorrect: true, score: 0) */
export const NON_CORRECTABLE_TYPES: ExerciseType[] = ['ESSAY', 'SHORT_ANSWER', 'SPEAKING'];

/** Map backend type to Portuguese label */
export const TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: 'Múltipla escolha',
  TRUE_FALSE: 'Verdadeiro ou Falso',
  TRANSLATION: 'Tradução',
  FILL_IN_THE_BLANK: 'Complete a lacuna',
  MATCHING: 'Correspondência',
  SHORT_ANSWER: 'Resposta curta',
  ESSAY: 'Redação',
  SPEAKING: 'Pronúncia / Speaking',
  LISTENING: 'Compreensão Auditiva / Listening',
};
