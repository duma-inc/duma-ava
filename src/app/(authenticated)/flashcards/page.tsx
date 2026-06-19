"use client";

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  ArrowLeftIcon,
  LightBulbIcon,
  CheckCircleIcon,
  SpeakerWaveIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface FlashcardResponse {
  id: string;
  front: string;
  back: string;
  context: string;
  dueDate: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

interface LearningFlashcard {
  card: FlashcardResponse;
  availableAt: number;
}

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const LEARN_AHEAD_LIMIT = 20 * MINUTE;
const HARD_INTERVAL_FACTOR = 1.2;
const EASY_INTERVAL_BONUS = 1.3;

function getReviewIntervalMs(card: FlashcardResponse, rating: number) {
  if (rating === 1) return MINUTE;

  const currentInterval = Math.max(card.intervalDays, 1);

  if (rating === 3) {
    return Math.max(1, Math.round(currentInterval * HARD_INTERVAL_FACTOR)) * DAY;
  }

  let goodIntervalDays: number;
  if (card.repetitions === 0) {
    goodIntervalDays = 1;
  } else if (card.repetitions === 1) {
    goodIntervalDays = 6;
  } else {
    goodIntervalDays = Math.max(1, Math.round(currentInterval * card.easeFactor));
  }

  if (rating === 5) {
    return Math.max(goodIntervalDays + 1, Math.round(goodIntervalDays * EASY_INTERVAL_BONUS)) * DAY;
  }

  return goodIntervalDays * DAY;
}

function formatInterval(ms: number) {
  if (ms < DAY) {
    const minutes = Math.max(1, Math.ceil(ms / MINUTE));
    return `${minutes} min`;
  }

  const days = Math.max(1, Math.round(ms / DAY));
  if (days < 7) return `${days} ${days === 1 ? 'dia' : 'dias'}`;

  if (days < 30) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }

  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30));
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  const years = Math.max(1, Math.round(days / 365));
  return `${years} ${years === 1 ? 'ano' : 'anos'}`;
}

function sortLearningQueue(cards: LearningFlashcard[]) {
  return [...cards].sort((a, b) => a.availableAt - b.availableAt);
}

function splitLearningQueue(
  cards: LearningFlashcard[],
  now: number,
  options?: { learnAhead?: boolean }
) {
  const limit = options?.learnAhead ? now + LEARN_AHEAD_LIMIT : now;
  const sortedCards = sortLearningQueue(cards);
  const readyCards = sortedCards.filter((item) => item.availableAt <= limit);
  const waitingCards = sortedCards.filter((item) => item.availableAt > limit);

  return { readyCards, waitingCards };
}

export default function FlashcardsReviewPage() {
  const [reviewQueue, setReviewQueue] = useState<FlashcardResponse[]>([]);
  const [learningQueue, setLearningQueue] = useState<LearningFlashcard[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [showBack, setShowBack] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function fetchDueCards() {
      try {
        const { data } = await api.get<FlashcardResponse[]>('/flashcards/due');
        setReviewQueue(data);
      } catch (err) {
        console.error('Failed to load flashcards:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDueCards();
  }, []);

  useEffect(() => {
    if (learningQueue.length === 0) return;

    const interval = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      setLearningQueue((queue) => {
        const { readyCards, waitingCards } = splitLearningQueue(queue, currentTime);
        if (readyCards.length === 0) return queue;

        setReviewQueue((reviewCards) => [
          ...reviewCards,
          ...readyCards.map((item) => item.card),
        ]);

        return waitingCards;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [learningQueue.length]);

  const sortedLearningQueue = sortLearningQueue(learningQueue);
  const nextLearningCard = sortedLearningQueue[0];
  const nextLearningWaitMs = nextLearningCard ? Math.max(0, nextLearningCard.availableAt - now) : 0;
  const reviewCard = reviewQueue[0];
  const isLearningAheadCard = !reviewCard && !!nextLearningCard && nextLearningWaitMs <= LEARN_AHEAD_LIMIT;
  const current = reviewCard || (isLearningAheadCard ? nextLearningCard.card : undefined);
  const currentCardId = current?.id;

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Safe catch
        }
      }
    };
  }, [currentCardId]);

  const pendingCount = reviewQueue.length + learningQueue.length;
  const reviewOptions = current
    ? [
        { rating: 1, title: 'Errei', interval: formatInterval(getReviewIntervalMs(current, 1)) },
        { rating: 3, title: 'Difícil', interval: formatInterval(getReviewIntervalMs(current, 3)) },
        { rating: 4, title: 'Bom', interval: formatInterval(getReviewIntervalMs(current, 4)) },
        { rating: 5, title: 'Fácil', interval: formatInterval(getReviewIntervalMs(current, 5)) },
      ]
    : [];

  function handleSpeakWord() {
    if (!current || typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    try {
      if (isSpeaking || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(current.front);
      utterance.lang = 'en-US';
      utterance.pitch = 0.95;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Error toggling flashcard TTS:', err);
      setIsSpeaking(false);
    }
  }

  async function handleReview(rating: number) {
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Safe catch
        }
      }
      setIsSpeaking(false);
      const { data: reviewedCard } = await api.post<FlashcardResponse>(
        `/flashcards/${current.id}/review`,
        { rating }
      );

      const reviewedDueTime = new Date(reviewedCard.dueDate).getTime();
      const availableAt = Number.isNaN(reviewedDueTime)
        ? Date.now() + getReviewIntervalMs(current, rating)
        : reviewedDueTime;
      const lapsedCard = {
        card: reviewedCard,
        availableAt,
      };

      if (isLearningAheadCard) {
        setLearningQueue((queue) => queue.filter((item) => item.card.id !== current.id));
      } else {
        setReviewQueue((queue) => queue.slice(1));
      }

      if (rating === 1) {
        setLearningQueue((queue) => {
          const nextQueue = sortLearningQueue([...queue, lapsedCard]);
          return nextQueue;
        });
      }

      setShowBack(false);
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

  if (pendingCount === 0) {
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

  if (!current && nextLearningCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center max-w-sm mx-auto">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <LightBulbIcon className="w-10 h-10 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-text-primary">Pausa curta</h2>
          <p className="text-primary text-sm leading-relaxed">
            O próximo flashcard volta em {formatInterval(nextLearningWaitMs)} para reforçar a memória antes de encerrar a sessão.
          </p>
        </div>
        <span className="text-xs font-extrabold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          {learningQueue.length} em aprendizado
        </span>
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
          {pendingCount} pendente(s)
        </span>
      </div>

      {/* Card Front */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl w-full p-8 sm:p-12 shadow-lg flex flex-col items-center text-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
        
        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl sm:text-4xl font-black text-text-primary capitalize tracking-tight">
            {current.front}
          </span>
          <button
            type="button"
            onClick={handleSpeakWord}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-primary-darker bg-background text-primary transition-all hover:border-primary hover:text-primary-dark"
            title={isSpeaking ? 'Parar leitura da palavra' : 'Ouvir palavra em inglês'}
            aria-label={isSpeaking ? 'Parar leitura da palavra' : 'Ouvir palavra em inglês'}
          >
            {isSpeaking ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <SpeakerWaveIcon className="h-5 w-5" />
            )}
          </button>
        </div>

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
                  &ldquo;{current.context}&rdquo;
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
              <span className="text-[10px] text-[#F44336]/70 font-semibold">
                {reviewOptions[0].interval}
              </span>
            </button>
            
            <button
              onClick={() => handleReview(3)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#1C1C1C] border border-[#D88A00] rounded-xl py-2.5 hover:border-primary active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#D88A00] font-bold text-xs">Difícil</span>
              <span className="text-[10px] text-[#D88A00]/70 font-semibold">
                {reviewOptions[1].interval}
              </span>
            </button>

            <button
              onClick={() => handleReview(4)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#1A3D1A]/50 border border-[#4CAF50]/50 rounded-xl py-2.5 hover:bg-[#1A3D1A] active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#4CAF50] font-bold text-xs">Bom</span>
              <span className="text-[10px] text-[#4CAF50]/70 font-semibold">
                {reviewOptions[2].interval}
              </span>
            </button>

            <button
              onClick={() => handleReview(5)}
              disabled={submitting}
              className="flex-1 flex flex-col items-center gap-1.5 bg-[#1A3D1A] border border-[#4CAF50] rounded-xl py-2.5 hover:bg-[#4CAF50]/30 active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-[#4CAF50] font-bold text-xs">Fácil</span>
              <span className="text-[10px] text-[#4CAF50]/70 font-semibold">
                {reviewOptions[3].interval}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
