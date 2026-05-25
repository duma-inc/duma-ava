"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';

interface FlashcardContextData {
  wordsSet: Set<string>;
  addWord: (word: string) => void;
  isLoading: boolean;
}

const FlashcardContext = createContext<FlashcardContextData>({} as FlashcardContextData);

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [wordsSet, setWordsSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;

    async function loadWords() {
      try {
        const { data } = await api.get<string[]>('/flashcards/words');
        setWordsSet(new Set(data));
      } catch (error) {
        console.error('[FlashcardContext] Error loading words:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWords();
  }, [status]);

  const addWord = (word: string) => {
    setWordsSet((prev) => new Set(prev).add(word));
  };

  return (
    <FlashcardContext.Provider value={{ wordsSet, addWord, isLoading }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcardContext = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcardContext must be used within a FlashcardProvider');
  }
  return context;
};
