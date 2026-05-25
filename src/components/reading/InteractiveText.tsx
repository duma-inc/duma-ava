"use client";

import React, { useState } from 'react';
import { useFlashcardContext } from '@/store/FlashcardContext';
import WordModal from './WordModal';

interface Props {
  text: string;
  fontSize?: number;
  lineHeight?: number | string;
  contentStyle?: React.CSSProperties;
}

export default function InteractiveText({ text, fontSize, lineHeight, contentStyle }: Props) {
  const { wordsSet } = useFlashcardContext();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const parts = text.split(/([\s\p{P}]+)/u);

  function normalize(word: string) {
    return word.trim().toLowerCase().replace(/[^\p{L}\p{Nd}]/gu, '');
  }

  function handleWordClick(word: string) {
    const norm = normalize(word);
    if (norm) {
      setSelectedWord(norm);
    }
  }

  function extractSentence(fullText: string, targetWord: string) {
    const sentences = fullText.split(/(?<=[.!?])\s+/);
    const normTarget = normalize(targetWord);
    for (const sentence of sentences) {
      const sentenceWords = sentence.split(/([\s\p{P}]+)/u);
      if (sentenceWords.some(w => normalize(w) === normTarget)) {
        return sentence;
      }
    }
    return fullText;
  }

  return (
    <>
      <div
        className="text-text-primary"
        style={{
          fontSize: fontSize ? `${fontSize}px` : '17px',
          lineHeight: lineHeight ? (typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight) : '28px',
          ...contentStyle
        }}
      >
        {parts.map((part, index) => {
          const norm = normalize(part);
          if (!norm) {
            return <span key={index}>{part}</span>;
          }

          const isSaved = wordsSet.has(norm);

          return (
            <span
              key={index}
              onClick={() => handleWordClick(part)}
              className={`cursor-pointer transition-colors duration-200 rounded-sm px-0.5 active:scale-95 inline-block ${
                isSaved
                  ? 'bg-primary/20 text-[#EDAA12] font-semibold hover:bg-primary/40'
                  : 'hover:bg-surface hover:text-[#EDAA12]'
              }`}
            >
              {part}
            </span>
          );
        })}
      </div>

      {selectedWord && (
        <WordModal
          word={selectedWord}
          contextSentence={extractSentence(text, selectedWord)}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </>
  );
}
