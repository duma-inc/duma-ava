"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WeeklyPlanResponse, EnrollmentResponse, Exercise } from '../types/exercise';
import { fetchWeeklyPlan, fetchMyEnrollments } from '../services/weeklyPlanService';

const CACHE_KEY = '@weekly_plan_v2';

interface ExerciseContextData {
  weeklyPlan: WeeklyPlanResponse | null;
  enrollments: EnrollmentResponse[];
  isLoading: boolean;
  error: string | null;
  getExercisesForDate(dateStr: string): Exercise[];
  refreshPlan(): Promise<void>;
}

const ExerciseContext = createContext<ExerciseContextData>({} as ExerciseContextData);

function isPlanValid(plan: WeeklyPlanResponse): boolean {
  const today = new Date().toISOString().split('T')[0];
  if (plan.weekEndDate < today) return false;
  const todayPlan = plan.dailyPlans?.find(d => d.date === today);
  if (todayPlan && todayPlan.exercises.length === 0) return false;
  const allExercises = plan.dailyPlans.flatMap(d => [
    ...d.exercises,
    ...(d.reinforcementExercises ?? []),
  ]);
  const hasStaleMatching = allExercises.some(
    ex => ex.type === 'MATCHING' && ex.options.some(o => !o.matchKey && !(o as any).match_key)
  );
  if (hasStaleMatching) return false;
  return true;
}

export const ExerciseProvider = ({ children }: { children: ReactNode }) => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlanResponse | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let myEnrollments: EnrollmentResponse[] = [];
      try {
        const enrollRes = await fetchMyEnrollments();
        myEnrollments = enrollRes.data || [];
      } catch (err: any) {
        console.log('[ExerciseContext] Failed to fetch enrollments, defaulting to empty:', err.message);
      }
      setEnrollments(myEnrollments);

      if (myEnrollments.length === 0) {
        console.log('[ExerciseContext] No enrollments found');
        setWeeklyPlan(null);
        setIsLoading(false);
        return;
      }

      const activeEnrollment = myEnrollments.find(e => e.status === 'ACTIVE') || myEnrollments[0];
      const skillId = activeEnrollment.skillId;

      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed: WeeklyPlanResponse = JSON.parse(cached);
            if (isPlanValid(parsed) && parsed.skillId === String(skillId)) {
              console.log('[ExerciseContext] Using cached weekly plan');
              setWeeklyPlan(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            // Invalid cache
          }
        }
      }

      console.log('[ExerciseContext] Fetching weekly plan from API...');
      const planRes = await fetchWeeklyPlan(skillId);
      const plan = planRes.data;
      setWeeklyPlan(plan);

      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify(plan));
      }
      console.log('[ExerciseContext] Weekly plan cached successfully');

    } catch (err: any) {
      console.error('[ExerciseContext] Error loading plan:', err);
      setError(err?.message || 'Erro ao carregar exercícios');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const getExercisesForDate = useCallback((dateStr: string): Exercise[] => {
    if (!weeklyPlan) return [];
    const daily = weeklyPlan.dailyPlans.find(d => d.date === dateStr);
    if (!daily) return [];
    return [
      ...daily.exercises,
      ...(daily.reinforcementExercises || []),
    ];
  }, [weeklyPlan]);

  const refreshPlan = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
    await loadPlan();
  }, [loadPlan]);

  return (
    <ExerciseContext.Provider
      value={{ weeklyPlan, enrollments, isLoading, error, getExercisesForDate, refreshPlan }}
    >
      {children}
    </ExerciseContext.Provider>
  );
};

export const useExerciseContext = () => {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return context;
};
