"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';
import { useSkillProfile } from './SkillProfileContext';

interface FlashcardContextData {
  wordsSet: Set<string>;
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  updateWord: (previousWord: string, nextWord: string) => void;
  refreshWords: () => Promise<void>;
  isLoading: boolean;
}

const FlashcardContext = createContext<FlashcardContextData>({} as FlashcardContextData);

function normalizeWord(word: string) {
  return word.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
}

export const FlashcardProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const { selectedSkill } = useSkillProfile();
  const selectedSkillId = selectedSkill?.id;
  const [wordsSet, setWordsSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const loadGeneration = useRef(0);

  const refreshWords = useCallback(async () => {
    if (status !== 'authenticated' || selectedSkillId == null) return;
    const generation = ++loadGeneration.current;

    setIsLoading(true);
    try {
      const { data } = await api.get<string[]>('/flashcards/words');
      if (generation !== loadGeneration.current) return;
      setWordsSet(new Set(data.map(normalizeWord)));
    } catch (error) {
      if (generation !== loadGeneration.current) return;
      console.error('[FlashcardContext] Error loading words:', error);
    } finally {
      if (generation === loadGeneration.current) setIsLoading(false);
    }
  }, [status, selectedSkillId]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshWords();
  }, [status, refreshWords]);

  const addWord = (word: string) => {
    setWordsSet((prev) => new Set(prev).add(normalizeWord(word)));
  };

  const removeWord = (word: string) => {
    setWordsSet((prev) => {
      const next = new Set(prev);
      next.delete(normalizeWord(word));
      return next;
    });
  };

  const updateWord = (previousWord: string, nextWord: string) => {
    setWordsSet((prev) => {
      const next = new Set(prev);
      next.delete(normalizeWord(previousWord));
      next.add(normalizeWord(nextWord));
      return next;
    });
  };

  return (
    <FlashcardContext.Provider value={{ wordsSet, addWord, removeWord, updateWord, refreshWords, isLoading }}>
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
