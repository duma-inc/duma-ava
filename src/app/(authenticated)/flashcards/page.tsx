"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ArrowLeftIcon, LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FlashcardResponse {
  id: string;
  front: string;
  back: string;
  context: string;
  dueDate: string;
  repetitions: number;
}

export default function FlashcardsReviewPage() {
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDueCards() {
      try {
        const { data } = await api.get<FlashcardResponse[]>('/flashcards/due');
        setCards(data);
      } catch (err) {
        console.error('Failed to load flashcards:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDueCards();
  }, []);

  const current = cards[currentIdx];

  async function handleReview(rating: number) {
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/flashcards/${current.id}/review`, { rating });
      setShowBack(false);
      setCurrentIdx((i) => i + 1);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-primary-dark">Carregando seus flashcards...</span>
      </div>
    );
  }

  if (cards.length === 0 || currentIdx >= cards.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-[#1A3D1A] rounded-full flex items-center justify-center">
          <CheckCircleIcon className="w-10 h-10 text-[#4CAF50]" />
        </div>
        <h2 className="text-2xl font-black text-text-primary">Tudo em dia!</h2>
        <p className="text-primary text-sm leading-relaxed">
          Você já revisou todos os seus flashcards pendentes de hoje. Volte amanhã para mais revisões ou adicione novas palavras durante suas leituras.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 w-full py-3.5 bg-surface border border-primary-darker hover:border-primary transition-colors rounded-xl font-bold text-text-primary"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full pb-10">
      <div className="flex items-center justify-between">
        <Link
          href="/conteudo"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Link>
        <span className="text-xs font-extrabold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          {cards.length - currentIdx} pendente(s)
        </span>
      </div>

      {/* Card Front */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl w-full p-8 sm:p-12 shadow-lg flex flex-col items-center text-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        
        <span className="text-3xl sm:text-4xl font-black text-text-primary capitalize tracking-tight mt-4">
          {current.front}
        </span>

        {showBack && (
          <div className="w-full flex flex-col items-center gap-6 mt-4">
            <div className="w-full h-px bg-[#2A2A2A]" />
            
            <span className="text-xl sm:text-2xl font-bold text-primary">
              {current.back}
            </span>

            {current.context && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-4 w-full flex flex-row gap-3 text-left items-start mt-2">
                <LightBulbIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-xs text-[#D88A00] italic leading-relaxed">
                  "{current.context}"
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full mt-2">
        {!showBack ? (
          <button
            onClick={() => setShowBack(true)}
            className="w-full py-3.5 bg-primary hover:brightness-110 text-black rounded-xl font-extrabold text-sm transition-all shadow-md cursor-pointer"
          >
            Mostrar Resposta
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => handleReview(1)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#3D1A1A] border border-[#F44336] rounded-xl py-2.5 hover:bg-[#F44336]/30 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#F44336] font-bold text-xs">Errei</span>
              <span className="text-[10px] text-[#F44336]/70 font-semibold">&lt; 1 min</span>
            </button>
            
            <button
              onClick={() => handleReview(3)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#1C1C1C] border border-[#D88A00] rounded-xl py-2.5 hover:border-primary active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#D88A00] font-bold text-xs">Difícil</span>
              <span className="text-[10px] text-[#D88A00]/70 font-semibold">Dias</span>
            </button>

            <button
              onClick={() => handleReview(4)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#1A3D1A]/50 border border-[#4CAF50]/50 rounded-xl py-2.5 hover:bg-[#1A3D1A] active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#4CAF50] font-bold text-xs">Bom</span>
              <span className="text-[10px] text-[#4CAF50]/70 font-semibold">Semanas</span>
            </button>

            <button
              onClick={() => handleReview(5)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#1A3D1A] border border-[#4CAF50] rounded-xl py-2.5 hover:bg-[#4CAF50]/30 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#4CAF50] font-bold text-xs">Fácil</span>
              <span className="text-[10px] text-[#4CAF50]/70 font-semibold">Meses</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
