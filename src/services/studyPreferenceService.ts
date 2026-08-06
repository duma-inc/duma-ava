import api from '../lib/api';
import {
  StudyPreferencesResponse,
  UpdateStudyPreferencesRequest,
} from '../types/studyPreference';

export const fetchStudyPreferences = () =>
  api.get<StudyPreferencesResponse>('/students/me/study-preferences');

export const updateStudyPreferences = (payload: UpdateStudyPreferencesRequest) =>
  api.put<StudyPreferencesResponse>('/students/me/study-preferences', payload);
