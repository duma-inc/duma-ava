export type WeekDay =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type ExerciseDifficulty = "EASY" | "MODERATE" | "HARD";

export interface StudyPreferencesResponse {
  studyDays: WeekDay[];
  dailyExerciseGoal: number;
  difficulty: ExerciseDifficulty | null;
  reminderEnabled: boolean;
}

export interface UpdateStudyPreferencesRequest {
  studyDays: WeekDay[];
  dailyExerciseGoal: number;
  difficulty: ExerciseDifficulty | null;
}
