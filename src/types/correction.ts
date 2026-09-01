/**
 * Correcoes dos exercicios dissertativos devolvidas ao aluno, agrupadas pelo dia do plano.
 * Espelha o ExerciseCorrectionResponse do duma-backend (e o correction.ts do duma-mobile).
 */

export interface CorrectionEntry {
  attemptId: number;
  exerciseId?: string;
  lessonId?: string;
  exerciseType?: string;
  exerciseDescription?: string;
  answerGiven?: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  correctedAt?: number;
}

export interface Correction {
  id: string;
  studentId: string;
  skillId?: string;
  /** yyyy-MM-dd — dia do plano semanal a que as correcoes pertencem. */
  planDate: string;
  totalCorrected?: number;
  status: 'PENDING_DELIVERY' | 'DELIVERED';
  seenByStudent: boolean;
  deliveredAt?: number;
  items: CorrectionEntry[];
}
