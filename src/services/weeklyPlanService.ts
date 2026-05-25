import api from '../lib/api';
import { WeeklyPlanResponse, EnrollmentResponse, AttemptPayload } from '../types/exercise';

export const fetchWeeklyPlan = async (skillId: string | number) => {
  const res = await api.get<WeeklyPlanResponse>(`/weekly-plans/current?skillId=${skillId}`);
  const allExercises = res.data.dailyPlans.flatMap(d => [...d.exercises, ...(d.reinforcementExercises ?? [])]);
  const matching = allExercises.find(e => e.type === 'MATCHING');
  if (matching) {
    console.log('[weeklyPlanService] MATCHING exercise raw options:', JSON.stringify(matching.options));
  }
  return res;
};

export const fetchMyEnrollments = () =>
  api.get<EnrollmentResponse[]>('/enrollments/me');

export const submitAttemptsBatch = (attempts: AttemptPayload[]) =>
  api.post('/attempts/batch', attempts);
