"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import {
  XMarkIcon,
  BookmarkIcon,
  ArrowPathIcon,
  SpeakerWaveIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import api from '@/lib/api';
import { useFlashcardContext } from '@/store/FlashcardContext';

interface Props {
  word: string;
  contextSentence: string;
  onClose: () => void;
}

interface FlashcardResponse {
  id: string;
  front: string;
  back: string;
  context: string;
  dueDate: string;
  repetitions: number;
}

interface TranslationLookupResponse {
  translation?: string;
  translations?: string[];
}

function formatTranslations(response: TranslationLookupResponse) {
  const translations = (response.translations || [])
    .map((item) => item.trim())
    .filter(Boolean);

  if (translations.length > 0) {
    return translations.join(', ');
  }

  return response.translation?.trim() || null;
}

export default function WordModal({ word, contextSentence, onClose }: Props) {
  const { wordsSet, addWord } = useFlashcardContext();
  const isSaved = wordsSet.has(word);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const [flashcard, setFlashcard] = useState<FlashcardResponse | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (isSaved) {
          const res = await api.get<FlashcardResponse>(`/flashcards/check?word=${word}`);
          setFlashcard(res.data);
          setTranslation(res.data.back);
        } else {
          const res = await api.get<TranslationLookupResponse>(`/flashcards/translate?text=${word}`);
          setTranslation(formatTranslations(res.data));
        }
      } catch (err) {
        console.error('Error fetching word data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [word, isSaved]);

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
  }, [word]);

  async function handleSave() {
    if (!translation) return;
    setSaving(true);
    try {
      const res = await api.post<FlashcardResponse>('/flashcards', {
        front: word,
        back: translation,
        context: contextSentence,
      });
      setFlashcard(res.data);
      addWord(word);
    } catch (err) {
      console.error('Error saving flashcard:', err);
    } finally {
      setSaving(false);
    }
  }

  function handleSpeakWord() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis is not supported in this browser.');
      return;
    }

    try {
      if (isSpeaking || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.pitch = 0.95;
      utterance.rate = 0.85;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Error toggling speech synthesis:', err);
      setIsSpeaking(false);
    }
  }

  return (
    <Transition show as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0">
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-y-full sm:translate-y-4 sm:opacity-0"
              enterTo="translate-y-0 sm:translate-y-0 sm:opacity-100"
              leave="ease-in duration-200"
              leaveFrom="translate-y-0 sm:translate-y-0 sm:opacity-100"
              leaveTo="translate-y-full sm:translate-y-4 sm:opacity-0"
            >
              <DialogPanel className="relative transform overflow-hidden bg-surface rounded-t-2xl sm:rounded-2xl text-left shadow-xl transition-all w-full sm:max-w-md border-t sm:border border-primary-darker p-6 flex flex-col gap-4">
                <div className="flex flex-row items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <DialogTitle as="h3" className="text-2xl font-black text-primary capitalize">
                        {word}
                      </DialogTitle>
                      <button
                        type="button"
                        onClick={handleSpeakWord}
                        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-primary-darker bg-[#1C1C1C] text-primary transition-all hover:border-primary hover:text-primary-dark"
                        title={isSpeaking ? 'Parar leitura da palavra' : 'Ouvir palavra em inglês'}
                        aria-label={isSpeaking ? 'Parar leitura da palavra' : 'Ouvir palavra em inglês'}
                      >
                        {isSpeaking ? (
                          <PauseIcon className="h-4.5 w-4.5" />
                        ) : (
                          <SpeakerWaveIcon className="h-4.5 w-4.5" />
                        )}
                      </button>
                    </div>
                    {loading ? (
                      <div className="h-5 w-24 bg-[#2A2A2A] animate-pulse rounded mt-1" />
                    ) : (
                      <span className="text-lg font-medium text-text-primary mt-1">
                        {translation || 'Tradução não encontrada'}
                      </span>
                    )}
                  </div>
                  <button onClick={onClose} className="text-primary-darker hover:text-primary transition-colors bg-[#1C1C1C] p-2 rounded-full">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#1A1A1A] border border-primary-darker/50 rounded-xl p-3.5 flex flex-col gap-1.5 mt-2">
                  <span className="text-xs font-bold text-primary-dark uppercase tracking-wider">Contexto</span>
                  <span className="text-sm text-[#F4E3C1] italic">&ldquo;{contextSentence}&rdquo;</span>
                </div>

                {isSaved && flashcard ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex flex-row items-center gap-2 text-[#4CAF50] bg-[#1A3D1A] border border-[#4CAF50]/30 p-3 rounded-xl">
                      <BookmarkSolidIcon className="w-5 h-5" />
                      <span className="text-sm font-bold">Salvo nos seus Flashcards</span>
                    </div>
                    <span className="text-xs text-primary-darker text-center mt-1">
                      Revisões feitas: {flashcard.repetitions}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={loading || saving || !translation}
                    className={`mt-4 w-full py-3.5 rounded-xl flex flex-row items-center justify-center gap-2 font-extrabold text-sm transition-all ${
                      loading || saving || !translation
                        ? 'bg-[#2A2A2A] text-[#4A4A4A] cursor-not-allowed'
                        : 'bg-primary border border-primary-dark text-black hover:brightness-110 active:scale-[0.98]'
                    }`}
                  >
                    {saving ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5" />
                    )}
                    {saving ? 'Salvando...' : 'Salvar como Flashcard'}
                  </button>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
