"use client";

import React, { useState } from 'react';
import { useFlashcardContext } from '@/store/FlashcardContext';
import WordModal from './WordModal';
import {
  extractSentence,
  normalizeInteractiveWord,
  renderInteractiveChildren,
} from './interactiveTextUtils';

interface Props {
  text: string;
  fontSize?: number;
  lineHeight?: number | string;
  contentStyle?: React.CSSProperties;
}

export default function InteractiveText({ text, fontSize, lineHeight, contentStyle }: Props) {
  const { wordsSet } = useFlashcardContext();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [contextSentence, setContextSentence] = useState('');

  function handleWordClick(word: string, contextText: string) {
    const normalizedWord = normalizeInteractiveWord(word);

    if (!normalizedWord) {
      return;
    }

    setSelectedWord(normalizedWord);
    setContextSentence(extractSentence(contextText, normalizedWord));
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
        {renderInteractiveChildren(text, wordsSet, (word) => handleWordClick(word, text), 'plain-text')}
      </div>

      {selectedWord && (
        <WordModal
          word={selectedWord}
          contextSentence={contextSentence}
          onClose={() => {
            setSelectedWord(null);
            setContextSentence('');
          }}
        />
      )}
    </>
  );
}
