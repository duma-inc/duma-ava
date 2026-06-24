"use client";

import React, { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useFlashcardContext } from "@/store/FlashcardContext";
import {
  ArrowLeftIcon,
  SquaresPlusIcon,
  CheckCircleIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PencilSquareIcon,
  PlusIcon,
  RectangleStackIcon,
  SpeakerWaveIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface FlashcardResponse {
  id: string;
  front: string;
  back: string;
  context: string;
  example?: string;
  dueDate: string;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
}

interface LearningFlashcard {
  card: FlashcardResponse;
  availableAt: number;
}

type FlashcardTab = "revisar" | "adicionar" | "explorar";
type FlashcardStatus = "all" | "due" | "learned";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
const LEARN_AHEAD_LIMIT = 20 * MINUTE;
const HARD_INTERVAL_FACTOR = 1.2;
const EASY_INTERVAL_BONUS = 1.3;

const tabs: Array<{ id: FlashcardTab; label: string; Icon: typeof RectangleStackIcon }> = [
  { id: "revisar", label: "Revisar", Icon: RectangleStackIcon },
  { id: "adicionar", label: "Adicionar", Icon: PlusIcon },
  { id: "explorar", label: "Explorar", Icon: MagnifyingGlassIcon },
];

function parseTab(tab: string | null): FlashcardTab {
  if (tab === "adicionar" || tab === "explorar" || tab === "revisar") {
    return tab;
  }

  return "revisar";
}

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
  if (days < 7) return `${days} ${days === 1 ? "dia" : "dias"}`;

  if (days < 30) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
  }

  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30));
    return `${months} ${months === 1 ? "mês" : "meses"}`;
  }

  const years = Math.max(1, Math.round(days / 365));
  return `${years} ${years === 1 ? "ano" : "anos"}`;
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

function formatDueDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem data";

  if (date.getTime() <= Date.now()) {
    return "Pendente";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function TabMenu({
  activeTab,
  onChange,
}: {
  activeTab: FlashcardTab;
  onChange: (tab: FlashcardTab) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl border border-primary-darker bg-surface p-1">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        const Icon = tab.Icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-extrabold transition-all sm:text-sm ${
              active
                ? "bg-primary text-text-on-primary"
                : "text-primary-dark hover:bg-primary-darker/20 hover:text-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function FlashcardForm({
  onCreated,
}: {
  onCreated: (flashcard: FlashcardResponse) => void;
}) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [context, setContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!front.trim() || !back.trim()) {
      setError("Preencha frente e verso para criar o flashcard.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post<FlashcardResponse>("/flashcards", {
        front: front.trim(),
        back: back.trim(),
        context: context.trim() || null,
      });

      onCreated(data);
      setFront("");
      setBack("");
      setContext("");
      setMessage("Flashcard adicionado ao banco de palavras.");
    } catch (err) {
      console.error("[Flashcards] Failed to create flashcard:", err);
      setError("Não foi possível criar o flashcard. Verifique se a palavra já existe.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-xl border border-primary-darker bg-surface p-4 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <SquaresPlusIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-black text-text-primary">Adicionar flashcard</h2>
          <p className="mt-1 text-sm leading-relaxed text-primary-dark">
            Crie uma palavra manualmente com tradução e contexto de uso.
          </p>
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-extrabold uppercase text-primary-dark">Frente</span>
        <input
          value={front}
          onChange={(event) => setFront(event.target.value)}
          placeholder="Word or expression"
          className="rounded-xl border border-primary-darker bg-background px-4 py-3 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-primary-darker focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-extrabold uppercase text-primary-dark">Verso</span>
        <input
          value={back}
          onChange={(event) => setBack(event.target.value)}
          placeholder="Tradução ou explicação"
          className="rounded-xl border border-primary-darker bg-background px-4 py-3 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-primary-darker focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-extrabold uppercase text-primary-dark">Contexto</span>
        <textarea
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Frase, anotação ou situação em que encontrou a palavra"
          rows={4}
          className="resize-none rounded-xl border border-primary-darker bg-background px-4 py-3 text-sm font-semibold leading-relaxed text-text-primary outline-none transition-colors placeholder:text-primary-darker focus:border-primary"
        />
      </label>

      {message && (
        <div className="rounded-xl border border-success bg-success/10 px-4 py-3 text-sm font-bold text-success">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-sm font-bold text-danger">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-extrabold text-text-on-primary shadow-md transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PlusIcon className="h-5 w-5" />
        {submitting ? "Salvando..." : "Adicionar flashcard"}
      </button>
    </form>
  );
}

function FlashcardsReviewView() {
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
        const { data } = await api.get<FlashcardResponse[]>("/flashcards/due");
        setReviewQueue(data);
      } catch (err) {
        console.error("Failed to load flashcards:", err);
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
      if (typeof window !== "undefined" && window.speechSynthesis) {
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
        { rating: 1, title: "Errei", interval: formatInterval(getReviewIntervalMs(current, 1)) },
        { rating: 3, title: "Difícil", interval: formatInterval(getReviewIntervalMs(current, 3)) },
        { rating: 4, title: "Bom", interval: formatInterval(getReviewIntervalMs(current, 4)) },
        { rating: 5, title: "Fácil", interval: formatInterval(getReviewIntervalMs(current, 5)) },
      ]
    : [];

  function handleSpeakWord() {
    if (!current || typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }

    try {
      if (isSpeaking || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(current.front);
      utterance.lang = "en-US";
      utterance.pitch = 0.95;
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Error toggling flashcard TTS:", err);
      setIsSpeaking(false);
    }
  }

  async function handleReview(rating: number) {
    if (!current || submitting) return;
    setSubmitting(true);
    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
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
        ? now + getReviewIntervalMs(current, rating)
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
        setLearningQueue((queue) => sortLearningQueue([...queue, lapsedCard]));
      }

      setShowBack(false);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <span className="text-primary-dark">Carregando seus flashcards...</span>
      </div>
    );
  }

  if (pendingCount === 0) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircleIcon className="h-10 w-10 text-success" />
        </div>
        <h2 className="text-2xl font-black text-text-primary">Tudo em dia!</h2>
        <p className="text-sm leading-relaxed text-primary">
          Você já revisou todos os seus flashcards pendentes de hoje. Volte amanhã para mais revisões ou adicione novas palavras durante suas leituras.
        </p>
      </div>
    );
  }

  if (!current && nextLearningCard) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-sm flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <LightBulbIcon className="h-10 w-10 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-text-primary">Pausa curta</h2>
          <p className="text-sm leading-relaxed text-primary">
            O próximo flashcard volta em {formatInterval(nextLearningWaitMs)} para reforçar a memória antes de encerrar a sessão.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
          {learningQueue.length} em aprendizado
        </span>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 pb-6">
      <div className="flex items-center justify-end">
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary">
          {pendingCount} pendente(s)
        </span>
      </div>

      <div className="relative flex w-full flex-col items-center gap-6 overflow-hidden rounded-xl border border-primary-darker bg-surface p-8 text-center shadow-lg sm:p-12">
        <div className="absolute left-0 top-0 h-1.5 w-full bg-primary" />

        <div className="mt-4 flex items-center gap-3">
          <span className="text-3xl font-black capitalize tracking-tight text-text-primary sm:text-4xl">
            {current.front}
          </span>
          <button
            type="button"
            onClick={handleSpeakWord}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-primary-darker bg-background text-primary transition-all hover:border-primary hover:text-primary-dark"
            title={isSpeaking ? "Parar leitura da palavra" : "Ouvir palavra em inglês"}
            aria-label={isSpeaking ? "Parar leitura da palavra" : "Ouvir palavra em inglês"}
          >
            {isSpeaking ? <PauseIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
          </button>
        </div>

        {showBack && (
          <div className="mt-4 flex w-full flex-col items-center gap-6">
            <div className="h-px w-full bg-primary-darker" />

            <span className="text-xl font-bold text-primary sm:text-2xl">{current.back}</span>

            {current.context && (
              <div className="mt-2 flex w-full flex-row items-start gap-3 rounded-xl border border-primary-darker bg-background p-4 text-left">
                <LightBulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-xs italic leading-relaxed text-primary-dark">
                  &ldquo;{current.context}&rdquo;
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-full">
        {!showBack ? (
          <button
            onClick={() => setShowBack(true)}
            className="w-full cursor-pointer rounded-xl bg-primary py-3.5 text-sm font-extrabold text-text-on-primary shadow-md transition-all hover:brightness-110"
          >
            Mostrar Resposta
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {reviewOptions.map((option) => (
              <button
                key={option.rating}
                onClick={() => handleReview(option.rating)}
                disabled={submitting}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-primary-darker bg-surface py-2.5 transition-all hover:border-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-xs font-bold text-primary">{option.title}</span>
                <span className="text-[10px] font-semibold text-primary-dark">{option.interval}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FlashcardsExploreView({
  onDeleted,
  onUpdated,
}: {
  onDeleted: (word: string) => void;
  onUpdated: (previousWord: string, nextWord: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FlashcardStatus>("all");
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ front: "", back: "", context: "" });
  const [savingId, setSavingId] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (status === "due") return "Pendentes";
    if (status === "learned") return "Aprendidos";
    return "Todos";
  }, [status]);

  useEffect(() => {
    let ignore = false;

    async function loadCards() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get<FlashcardResponse[]>("/flashcards", {
          params: { q: query || undefined, status },
        });
        if (!ignore) setCards(data);
      } catch (err) {
        console.error("[Flashcards] Failed to load word bank:", err);
        if (!ignore) setError("Não foi possível carregar o banco de palavras.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCards();
    return () => {
      ignore = true;
    };
  }, [query, status]);

  function startEdit(card: FlashcardResponse) {
    setEditingId(card.id);
    setDraft({
      front: card.front,
      back: card.back,
      context: card.context || "",
    });
  }

  async function handleUpdate(card: FlashcardResponse) {
    if (!draft.front.trim() || !draft.back.trim()) {
      setError("Frente e verso são obrigatórios para editar.");
      return;
    }

    setSavingId(card.id);
    setError(null);
    try {
      const { data } = await api.put<FlashcardResponse>(`/flashcards/${card.id}`, {
        front: draft.front.trim(),
        back: draft.back.trim(),
        context: draft.context.trim() || null,
        example: card.example || null,
      });

      setCards((currentCards) => currentCards.map((item) => (item.id === card.id ? data : item)));
      setEditingId(null);
      onUpdated(card.front, data.front);
    } catch (err) {
      console.error("[Flashcards] Failed to update flashcard:", err);
      setError("Não foi possível editar o flashcard. Verifique se a palavra já existe.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(card: FlashcardResponse) {
    const confirmed = window.confirm(`Excluir o flashcard "${card.front}"?`);
    if (!confirmed) return;

    setSavingId(card.id);
    setError(null);
    try {
      await api.delete(`/flashcards/${card.id}`);
      setCards((currentCards) => currentCards.filter((item) => item.id !== card.id));
      onDeleted(card.front);
    } catch (err) {
      console.error("[Flashcards] Failed to delete flashcard:", err);
      setError("Não foi possível excluir o flashcard.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-primary-darker bg-surface p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px]">
          <label className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-dark" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por frente, verso ou contexto"
              className="w-full rounded-xl border border-primary-darker bg-background py-3 pl-10 pr-4 text-sm font-semibold text-text-primary outline-none transition-colors placeholder:text-primary-darker focus:border-primary"
            />
          </label>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as FlashcardStatus)}
            className="cursor-pointer rounded-xl border border-primary-darker bg-background px-4 py-3 text-sm font-extrabold text-text-primary outline-none transition-colors focus:border-primary"
            aria-label="Filtrar status dos flashcards"
          >
            <option value="all">Todos</option>
            <option value="due">Pendentes</option>
            <option value="learned">Aprendidos</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger bg-danger/10 px-4 py-3 text-sm font-bold text-danger">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-primary-darker bg-surface">
        <div className="flex items-center justify-between border-b border-primary-darker px-4 py-3">
          <h2 className="text-sm font-black text-text-primary">Banco de palavras</h2>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
            {loading ? "Carregando" : `${cards.length} ${statusLabel.toLowerCase()}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-background">
              <tr className="text-xs uppercase text-primary-dark">
                <th className="px-4 py-3 font-extrabold">Frente</th>
                <th className="px-4 py-3 font-extrabold">Verso</th>
                <th className="px-4 py-3 font-extrabold">Contexto</th>
                <th className="px-4 py-3 font-extrabold">Próxima revisão</th>
                <th className="px-4 py-3 font-extrabold">Revisões</th>
                <th className="px-4 py-3 text-right font-extrabold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-primary-dark">
                    Carregando banco de palavras...
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm font-semibold text-primary-dark">
                    Nenhum flashcard encontrado.
                  </td>
                </tr>
              ) : (
                cards.map((card) => {
                  const editing = editingId === card.id;
                  const saving = savingId === card.id;

                  return (
                    <tr key={card.id} className="border-t border-primary-darker align-top">
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            value={draft.front}
                            onChange={(event) => setDraft((current) => ({ ...current, front: event.target.value }))}
                            className="w-full rounded-xl border border-primary-darker bg-background px-3 py-2 text-sm font-semibold text-text-primary outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="text-sm font-extrabold capitalize text-text-primary">{card.front}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editing ? (
                          <input
                            value={draft.back}
                            onChange={(event) => setDraft((current) => ({ ...current, back: event.target.value }))}
                            className="w-full rounded-xl border border-primary-darker bg-background px-3 py-2 text-sm font-semibold text-text-primary outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-primary">{card.back}</span>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-3">
                        {editing ? (
                          <textarea
                            value={draft.context}
                            onChange={(event) => setDraft((current) => ({ ...current, context: event.target.value }))}
                            rows={2}
                            className="w-full resize-none rounded-xl border border-primary-darker bg-background px-3 py-2 text-sm font-semibold text-text-primary outline-none focus:border-primary"
                          />
                        ) : (
                          <span className="line-clamp-2 text-xs leading-relaxed text-primary-dark">
                            {card.context || "Sem contexto"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-primary-dark">
                        {formatDueDate(card.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-text-primary">{card.repetitions}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {editing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdate(card)}
                                disabled={saving}
                                className="cursor-pointer rounded-xl border border-success bg-success/10 px-3 py-2 text-xs font-extrabold text-success transition-colors hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                disabled={saving}
                                className="cursor-pointer rounded-xl border border-primary-darker px-3 py-2 text-xs font-extrabold text-primary-dark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(card)}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-primary-darker text-primary transition-colors hover:border-primary"
                                title="Editar flashcard"
                                aria-label={`Editar flashcard ${card.front}`}
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(card)}
                                disabled={saving}
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-primary-darker text-danger transition-colors hover:border-danger disabled:cursor-not-allowed disabled:opacity-60"
                                title="Excluir flashcard"
                                aria-label={`Excluir flashcard ${card.front}`}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FlashcardsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));
  const { addWord, removeWord, updateWord } = useFlashcardContext();

  function handleTabChange(tab: FlashcardTab) {
    router.replace(`/flashcards?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/conteudo"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-primary-darker bg-surface text-primary transition-all hover:border-primary"
            title="Voltar para conteúdo"
            aria-label="Voltar para conteúdo"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-text-primary">Flashcards</h1>
            <p className="mt-1 text-sm text-primary-dark">Revise, crie e organize seu vocabulário.</p>
          </div>
        </div>
      </div>

      <TabMenu activeTab={activeTab} onChange={handleTabChange} />

      {activeTab === "revisar" && <FlashcardsReviewView />}
      {activeTab === "adicionar" && <FlashcardForm onCreated={(flashcard) => addWord(flashcard.front)} />}
      {activeTab === "explorar" && (
        <FlashcardsExploreView
          onDeleted={removeWord}
          onUpdated={updateWord}
        />
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-primary-dark">Carregando flashcards...</span>
        </div>
      }
    >
      <FlashcardsPageContent />
    </Suspense>
  );
}
