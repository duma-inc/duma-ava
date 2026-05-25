import { useState, useCallback, useMemo, useRef } from 'react';
import { Exercise, ExerciseResult, AttemptPayload, NON_RETRYABLE_TYPES, NON_CORRECTABLE_TYPES } from '../types/exercise';
import { useExerciseContext } from '../store/ExerciseContext';
import { submitAttemptsBatch } from '../services/weeklyPlanService';

/**
 * Removes accents/diacritics from a string.
 */
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalizes text for comparison:
 * lowercase, remove accents, remove punctuation, trim.
 */
function normalize(str: string): string {
  return removeAccents(str.trim().toLowerCase()).replace(/[.,;:!?'"()\-]/g, '').trim();
}

/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

/**
 * Checks if the user answer matches.
 * - ESSAY and SHORT_ANSWER: always true (non-correctable).
 * - MATCHING: validates pairs via matchKey.
 * - Other types: fuzzy match with Levenshtein ≤ 2.
 */
function checkAnswer(exercise: Exercise, userAnswer: string): boolean {
  if (NON_CORRECTABLE_TYPES.includes(exercise.type)) {
    return true;
  }

  // MATCHING: answer is JSON of pairs { termText: defText }
  if (exercise.type === 'MATCHING') {
    try {
      const pairs: Record<string, string> = JSON.parse(userAnswer);
      return Object.entries(pairs).every(([termText, selectedDef]) => {
        const term = exercise.options.find((o) => o.text === termText);
        if (!term) return false;
        const termMatchKey = term.matchKey ?? (term as any).match_key;
        return termMatchKey === selectedDef;
      });
    } catch {
      return false;
    }
  }

  const correctOptions = exercise.options
    .filter((o) => o.isCorrect)
    .map((o) => o.text);

  const accepted = correctOptions.flatMap((t) =>
    t.includes('|') ? t.split('|').map((s) => s.trim()) : [t.trim()]
  );

  const normalizedAnswer = normalize(userAnswer);

  return accepted.some((opt) => {
    const normalizedOpt = normalize(opt);
    if (normalizedAnswer === normalizedOpt) return true;
    return levenshtein(normalizedAnswer, normalizedOpt) <= 2;
  });
}

/**
 * Score: non-retryable types always 0.
 */
function calculateScore(exercise: Exercise, isCorrect: boolean): number {
  if (NON_RETRYABLE_TYPES.includes(exercise.type)) return 0;
  return isCorrect ? 10 : 0;
}

interface UseExercisesReturn {
  exercises: Exercise[];
  current: Exercise | null;
  currentIndex: number;
  total: number;
  isLast: boolean;
  answered: boolean;
  selectedAnswer: string | null;
  isCurrentCorrect: boolean | null;
  results: ExerciseResult[];
  attempts: AttemptPayload[];
  finished: boolean;
  retryRound: boolean;
  totalCorrect: number;
  totalWrong: number;
  pendingCorrection: number;
  submitAnswer: (answer: string) => boolean;
  skipExercise: () => void;
  next: () => void;
  submitAllAttempts: () => Promise<void>;
  isSubmitting: boolean;
}

export function useExercises(dateStr: string): UseExercisesReturn {
  const { getExercisesForDate } = useExerciseContext();
  const allExercises = useMemo(() => getExercisesForDate(dateStr), [dateStr, getExercisesForDate]);

  const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>(allExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [retryRound, setRetryRound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStart, setQuestionStart] = useState(Date.now());

  const resultsRef = useRef<ExerciseResult[]>([]);
  const attemptsRef = useRef<AttemptPayload[]>([]);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [attempts, setAttempts] = useState<AttemptPayload[]>([]);

  const currentRoundWrongRef = useRef<Set<string>>(new Set());

  const current = exerciseQueue[currentIndex] ?? null;
  const total = exerciseQueue.length;
  const isLast = currentIndex === total - 1;

  const uniqueResults = useMemo(() => {
    const map = new Map<string, ExerciseResult>();
    for (const r of results) {
      map.set(r.exerciseId, r);
    }
    return Array.from(map.values());
  }, [results]);

  const totalCorrect = uniqueResults.filter((r) => r.isCorrect).length;
  const totalWrong = uniqueResults.filter((r) => !r.isCorrect && !NON_RETRYABLE_TYPES.includes(r.type)).length;
  const pendingCorrection = uniqueResults.filter(
    (r) => r.type === 'ESSAY' || r.type === 'SHORT_ANSWER'
  ).length;

  function submitAnswer(answer: string): boolean {
    if (answered || !current) return false;

    const isCorrect = checkAnswer(current, answer);
    const score = calculateScore(current, isCorrect);
    const timeSpent = Math.round((Date.now() - questionStart) / 1000);

    setSelectedAnswer(answer);
    setIsCurrentCorrect(isCorrect);
    setAnswered(true);

    const newResult: ExerciseResult = { exerciseId: current.id, isCorrect, answer, type: current.type };
    const newAttempt: AttemptPayload = {
      lessonId: current.lessonId,
      exerciseId: current.id,
      answerGiven: answer,
      isCorrect,
      score,
      timeSpentSeconds: timeSpent,
    };

    resultsRef.current = [...resultsRef.current, newResult];
    attemptsRef.current = [...attemptsRef.current, newAttempt];
    setResults(resultsRef.current);
    setAttempts(attemptsRef.current);

    if (!isCorrect && !NON_RETRYABLE_TYPES.includes(current.type)) {
      currentRoundWrongRef.current.add(current.id);
    } else {
      currentRoundWrongRef.current.delete(current.id);
    }

    return isCorrect;
  }

  function next() {
    if (!answered) return;

    if (isLast) {
      const wrongInThisRound = exerciseQueue.filter(
        (ex) => currentRoundWrongRef.current.has(ex.id)
      );

      if (wrongInThisRound.length > 0) {
        currentRoundWrongRef.current = new Set();
        setExerciseQueue(wrongInThisRound);
        setCurrentIndex(0);
        setAnswered(false);
        setSelectedAnswer(null);
        setIsCurrentCorrect(null);
        setRetryRound(true);
        setQuestionStart(Date.now());
      } else {
        setFinished(true);
      }
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      setSelectedAnswer(null);
      setIsCurrentCorrect(null);
      setQuestionStart(Date.now());
    }
  }

  const submitAllAttempts = useCallback(async () => {
    if (isSubmitting) return;
    const toSubmit = attemptsRef.current;
    if (toSubmit.length === 0) return;
    setIsSubmitting(true);
    try {
      await submitAttemptsBatch(toSubmit);
      console.log('[useExercises] Attempts submitted successfully:', toSubmit.length);
    } catch (err: any) {
      console.error('[useExercises] Failed to submit attempts:', err?.message || err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  function skipExercise() {
    if (!current) return;
    const newQueue = exerciseQueue.filter((ex) => ex.id !== current.id);
    if (newQueue.length === 0) {
      setFinished(true);
      return;
    }
    setExerciseQueue(newQueue);
    setCurrentIndex((i) => Math.min(i, newQueue.length - 1));
    setAnswered(false);
    setSelectedAnswer(null);
    setIsCurrentCorrect(null);
    setQuestionStart(Date.now());
  }

  return {
    exercises: exerciseQueue,
    current,
    currentIndex,
    total,
    isLast,
    answered,
    selectedAnswer,
    isCurrentCorrect,
    results,
    attempts,
    finished,
    retryRound,
    totalCorrect,
    totalWrong,
    pendingCorrection,
    submitAnswer,
    skipExercise,
    next,
    submitAllAttempts,
    isSubmitting,
  };
}
