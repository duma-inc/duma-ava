import api from '../lib/api';
import { WeeklyPlanResponse, EnrollmentResponse, AttemptPayload } from '../types/exercise';

export const fetchWeeklyPlan = async (skillId: string | number) => {
  const res = await api.get<WeeklyPlanResponse>('/weekly-plans/current', {
    params: { skillId },
  });
  const allExercises = res.data.dailyPlans.flatMap(d => [...d.exercises, ...(d.reinforcementExercises ?? [])]);
  const matching = allExercises.find(e => e.type === 'MATCHING');
  if (matching) {
    console.log('[weeklyPlanService] MATCHING exercise raw options:', JSON.stringify(matching.options));
  }
  return res;
};

export const fetchMyEnrollments = () =>
  api.get<EnrollmentResponse[]>('/enrollments/me');

/**
 * Entrega a sessao inteira. `planDate` (yyyy-MM-dd) diz ao backend qual dia do plano foi
 * concluido — e o que fecha o dia e impede refazer os exercicios. Um segundo envio para a
 * mesma data responde 409.
 */
export const submitAttemptsBatch = (attempts: AttemptPayload[], planDate: string) =>
  api.post('/attempts/batch', attempts, { params: { planDate } });
