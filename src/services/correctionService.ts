import api from '../lib/api';
import { Correction } from '../types/correction';

/** Correcoes entregues do aluno autenticado (mais recentes primeiro). */
export const fetchMyCorrections = () => api.get<Correction[]>('/exercise-corrections/me');

/** Marca a correcao como vista, limpando o indicador in-app. */
export const markCorrectionSeen = (id: string) =>
  api.put<Correction>(`/exercise-corrections/${id}/seen`);
