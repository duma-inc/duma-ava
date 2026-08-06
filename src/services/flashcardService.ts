import api from '../lib/api';
import { FlashcardResponse } from '../types/flashcard';

export const fetchDueFlashcards = () =>
  api.get<FlashcardResponse[]>('/flashcards/due');
