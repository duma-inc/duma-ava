export interface FlashcardResponse {
  id: string;
  front: string;
  back: string;
  context?: string | null;
  example?: string | null;
  dueDate: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}
