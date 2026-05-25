"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ArrowPathIcon, CheckIcon, XMarkIcon, TrophyIcon } from "@heroicons/react/24/outline";
import { sentenceBuilderPacks } from "@/mocks/games";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SentenceBuilderGamePage({ params }: PageProps) {
  const { id } = use(params);

  const pack = useMemo(() => sentenceBuilderPacks.find((p) => p.id === id), [id]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const sentences = pack?.sentences ?? [];
  const currentSentence = sentences[currentIdx];

  // Initialize and shuffle words for current sentence
  useEffect(() => {
    if (currentSentence) {
      const words = currentSentence.sentence.split(" ");
      // Shuffle helper
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWordBank(shuffled);
      setSelectedWords([]);
      setIsChecked(false);
      setIsCorrect(false);
    }
  }, [currentIdx, currentSentence]);

  const handleWordSelect = (word: string, index: number) => {
    if (isChecked) return;
    setSelectedWords((prev) => [...prev, word]);
    setWordBank((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleWordDeselect = (word: string, index: number) => {
    if (isChecked) return;
    setSelectedWords((prev) => prev.filter((_, idx) => idx !== index));
    setWordBank((prev) => [...prev, word]);
  };

  const handleCheck = () => {
    if (selectedWords.length === 0) return;
    const answer = selectedWords.join(" ");
    const correct = answer === currentSentence.sentence;
    setIsCorrect(correct);
    setIsChecked(true);
    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < sentences.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    if (currentSentence) {
      const words = currentSentence.sentence.split(" ");
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setWordBank(shuffled);
      setSelectedWords([]);
      setIsChecked(false);
      setIsCorrect(false);
    }
  };

  if (!pack || sentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <h2 className="text-xl font-bold text-primary">Pacote não encontrado</h2>
        <Link href="/conteudo/games" className="text-sm text-primary hover:underline">
          Voltar para games
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-sm mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
          <TrophyIcon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-primary mb-1">Pacote Concluído!</h2>
          <p className="text-xs text-primary-dark font-medium uppercase tracking-wider mb-4">
            {pack.weekLabel} · {pack.title}
          </p>
          <p className="text-text-primary text-sm leading-relaxed mb-6">
            Você montou <strong className="text-primary font-bold">{score}</strong> de{" "}
            <strong className="text-primary font-bold">{sentences.length}</strong> frases corretamente! Continue jogando para treinar a sua escrita.
          </p>
          <Link
            href="/conteudo/games"
            className="w-full block bg-primary hover:brightness-110 text-black py-3 rounded-xl font-extrabold text-sm transition-all shadow-md cursor-pointer"
          >
            Voltar aos Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-xl mx-auto w-full">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/conteudo/games"
          className="p-2 bg-surface rounded-lg border border-primary-darker hover:border-primary text-primary transition-all cursor-pointer"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <span className="text-xs font-extrabold text-primary-dark uppercase">
          {pack.title} · {pack.weekLabel}
        </span>
        <span className="text-xs font-extrabold text-primary">
          Frase {currentIdx + 1}/{sentences.length}
        </span>
      </div>

      {/* Progress meter */}
      <div className="w-full bg-[#1C1C1C] h-1.5 rounded-full overflow-hidden border border-primary-darker/50">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / sentences.length) * 100}%` }}
        />
      </div>

      {/* Game board */}
      <div className="bg-[#1C1C1C] border border-primary-darker rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col gap-5">
        {/* Instruction/prompt */}
        <div>
          <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Instrução
          </span>
          <p className="text-[15px] font-bold text-text-primary mt-2">
            {currentSentence.prompt}
          </p>
        </div>

        {/* Selected assembly slots */}
        <div className="min-h-[90px] w-full bg-surface border border-primary-darker/60 rounded-xl p-3 flex flex-wrap gap-2 items-center content-center justify-center relative">
          {selectedWords.length === 0 ? (
            <span className="text-xs text-primary-dark font-medium italic">
              Selecione as palavras abaixo...
            </span>
          ) : (
            selectedWords.map((word, idx) => (
              <button
                key={`${word}-${idx}`}
                disabled={isChecked}
                onClick={() => handleWordDeselect(word, idx)}
                className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all border
                  ${
                    isChecked
                      ? isCorrect
                        ? "bg-success/10 border-success text-success cursor-default"
                        : "bg-danger/10 border-danger text-danger cursor-default"
                      : "bg-primary text-black border-primary hover:brightness-110 cursor-pointer shadow-sm"
                  }
                `}
              >
                {word}
              </button>
            ))
          )}
        </div>

        {/* Verification banner feedback */}
        {isChecked && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all
              ${
                isCorrect
                  ? "bg-success/15 border-success text-success"
                  : "bg-danger/15 border-danger text-danger"
              }
            `}
          >
            {isCorrect ? (
              <>
                <CheckIcon className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs font-bold">Excelente! A resposta está correta.</span>
              </>
            ) : (
              <>
                <XMarkIcon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">Frase incorreta. Tente de novo!</p>
                  <p className="text-[11px] opacity-80 mt-0.5 truncate">
                    Correto: {currentSentence.sentence}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Shuffled Word Bank */}
        <div className="flex flex-wrap gap-2 justify-center items-center py-2 min-h-[50px]">
          {wordBank.map((word, idx) => (
            <button
              key={`${word}-${idx}`}
              disabled={isChecked}
              onClick={() => handleWordSelect(word, idx)}
              className="px-3 py-1.5 text-sm font-bold bg-surface border border-primary-darker/60 hover:border-primary text-text-primary rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons Controls */}
      <div className="flex gap-2">
        {isChecked ? (
          <>
            {!isCorrect && (
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 border border-primary text-primary py-3 rounded-xl font-extrabold text-xs transition-all hover:bg-primary/10 cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Tentar de Novo
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 bg-primary hover:brightness-110 text-black py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-md"
            >
              {currentIdx + 1 === sentences.length ? "Ver Resultados" : "Próxima Frase"}
            </button>
          </>
        ) : (
          <button
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className="w-full bg-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-black py-3 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-md"
          >
            Verificar Resposta
          </button>
        )}
      </div>
    </div>
  );
}
