"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Correction } from '../types/correction';
import { fetchMyCorrections, markCorrectionSeen } from '../services/correctionService';
import { useSkillProfile } from './SkillProfileContext';

// Bump this version whenever the correction shape changes to invalidate old caches.
const cacheKey = (skillId?: number) => `@corrections_v2:${skillId ?? 'none'}`;

interface CorrectionContextData {
  corrections: Correction[];
  isLoading: boolean;
  error: string | null;
  /** Correcao entregue correspondente ao dia do plano (yyyy-MM-dd), se houver. */
  getCorrectionForDate(dateStr: string): Correction | undefined;
  /** Ha alguma correcao entregue ainda nao vista — dirige o indicador in-app. */
  hasUnseen: boolean;
  markSeen(id: string): Promise<void>;
  refreshCorrections(): Promise<void>;
}

const CorrectionContext = createContext<CorrectionContextData>({} as CorrectionContextData);

function parseCached(raw: string): Correction[] | null {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Correction[]) : null;
  } catch {
    return null;
  }
}

export const CorrectionProvider = ({ children }: { children: ReactNode }) => {
  const { selectedSkill } = useSkillProfile();
  const selectedSkillId = selectedSkill?.id;
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGeneration = useRef(0);

  const persist = useCallback((list: Correction[]) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey(selectedSkillId), JSON.stringify(list));
      } catch {
        // cache best-effort
      }
    }
  }, [selectedSkillId]);

  const loadCorrections = useCallback(async () => {
    const generation = ++loadGeneration.current;
    try {
      setIsLoading(true);
      setError(null);

      // Mostra o cache imediatamente (evita tela vazia ao abrir), depois revalida com a API.
      if (typeof window !== 'undefined') {
        setCorrections([]);
        const cached = localStorage.getItem(cacheKey(selectedSkillId));
        if (cached) {
          const parsed = parseCached(cached);
          if (parsed) setCorrections(parsed);
        }
      }

      const res = await fetchMyCorrections();
      if (generation !== loadGeneration.current) return;
      const list = res.data || [];
      setCorrections(list);
      persist(list);
    } catch (err: unknown) {
      if (generation !== loadGeneration.current) return;
      console.error('[CorrectionContext] Erro ao carregar correcoes:', err);
      // Nao apaga o que ja veio do cache; so registra o erro.
      setError(err instanceof Error ? err.message : 'Erro ao carregar correcoes');
    } finally {
      if (generation === loadGeneration.current) setIsLoading(false);
    }
  }, [persist, selectedSkillId]);

  useEffect(() => {
    queueMicrotask(() => { void loadCorrections(); });
  }, [loadCorrections]);

  const getCorrectionForDate = useCallback(
    (dateStr: string): Correction | undefined =>
      corrections.find(c => c.planDate === dateStr && c.status === 'DELIVERED'),
    [corrections],
  );

  const hasUnseen = corrections.some(c => c.status === 'DELIVERED' && !c.seenByStudent);

  const markSeen = useCallback(async (id: string) => {
    setCorrections(prev => {
      const target = prev.find(c => c.id === id);
      if (!target || target.seenByStudent) return prev;
      const updated = prev.map(c => (c.id === id ? { ...c, seenByStudent: true } : c));
      persist(updated);
      return updated;
    });

    try {
      await markCorrectionSeen(id);
    } catch (err) {
      console.error('[CorrectionContext] Falha ao marcar correcao como vista:', err);
    }
  }, [persist]);

  const refreshCorrections = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey(selectedSkillId));
    }
    await loadCorrections();
  }, [loadCorrections, selectedSkillId]);

  return (
    <CorrectionContext.Provider
      value={{
        corrections,
        isLoading,
        error,
        getCorrectionForDate,
        hasUnseen,
        markSeen,
        refreshCorrections,
      }}
    >
      {children}
    </CorrectionContext.Provider>
  );
};

export const useCorrectionContext = () => {
  const context = useContext(CorrectionContext);
  if (!context) {
    throw new Error('useCorrectionContext must be used within a CorrectionProvider');
  }
  return context;
};
