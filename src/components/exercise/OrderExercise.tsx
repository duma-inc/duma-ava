'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Exercise, parseOrderExercise } from '../../types/exercise';
import { shuffleItems } from '../../lib/shuffle';

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

/** Uma palavra da frase. O id e proprio porque a mesma palavra pode repetir. */
interface Word {
  id: string;
  text: string;
}

/**
 * Embaralha ate nao cair na ordem correta — comecar ja respondido entregaria o
 * exercicio de graca. Com 2 palavras so ha uma alternativa, entao inverte.
 */
function shuffleAwayFromAnswer(words: Word[]): string[] {
  const answer = words.map((w) => w.id).join('|');
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = shuffleItems(words).map((w) => w.id);
    if (candidate.join('|') !== answer) return candidate;
  }
  return [...words].reverse().map((w) => w.id);
}

function WordChip({ word, disabled }: { word: Word; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: word.id,
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      {...attributes}
      {...listeners}
      className={`border-[1.5px] rounded-xl px-3.5 py-2 text-[15px] font-bold touch-none select-none transition-colors bg-surface border-primary-darker text-text-primary ${
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:border-primary'
      }`}
    >
      {word.text}
    </button>
  );
}

/**
 * ORDER: o aluno arrasta as palavras para deixa-las na ordem certa.
 *
 * A ordem e montada no proprio lugar — a lista que aparece na tela ja e a
 * resposta. A primeira versao tinha duas areas (um "banco" e uma "linha de
 * resposta") e o aluno precisava mover as palavras de uma para a outra; como o
 * enunciado pede "coloque as palavras na ordem correta", o gesto natural era
 * reordenar no banco mesmo, a linha de resposta ficava vazia e o botao de
 * confirmar nunca habilitava.
 */
export default function OrderExercise({ exercise, answered, isCorrect, onAnswer }: Props) {
  const words = useMemo<Word[]>(
    () =>
      parseOrderExercise(exercise).tokens.map((option, index) => ({
        id: `${exercise.id}-w${index}`,
        text: option.text,
      })),
    [exercise],
  );

  const [order, setOrder] = useState<string[]>(() => shuffleAwayFromAnswer(words));
  const [draggingId, setDraggingId] = useState<UniqueIdentifier | null>(null);

  const byId = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);
  const sentence = order.map((id) => byId.get(id)?.text ?? '').join(' ');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null);
    if (!over || active.id === over.id) return;
    setOrder((current) => {
      const from = current.indexOf(String(active.id));
      const to = current.indexOf(String(over.id));
      if (from === -1 || to === -1) return current;
      return arrayMove(current, from, to);
    });
  }

  if (words.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">
        Arraste as palavras para a ordem correta
      </p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }: DragStartEvent) => setDraggingId(active.id)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="flex flex-row flex-wrap gap-2 min-h-[64px] border-[1.5px] border-dashed border-primary-darker rounded-xl p-3 bg-surface/60">
            {order.map((id) => {
              const word = byId.get(id);
              if (!word) return null;
              return <WordChip key={id} word={word} disabled={answered} />;
            })}
          </div>
        </SortableContext>

        {/* A palavra arrastada segue o cursor */}
        <DragOverlay>
          {draggingId ? (
            <div className="border-[1.5px] border-primary bg-primary-darker/60 rounded-xl px-3.5 py-2 text-[15px] font-bold text-text-primary">
              {byId.get(String(draggingId))?.text}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Previa da frase montada, para o aluno ler o que vai enviar */}
      {!answered && (
        <p className="text-sm text-primary-dark">
          Sua frase: <span className="text-text-primary font-semibold">{sentence}</span>
        </p>
      )}

      {/* Acoes */}
      {!answered && (
        <div className="flex flex-row gap-2.5 items-center mt-2">
          <button
            type="button"
            onClick={() => setOrder(shuffleAwayFromAnswer(words))}
            aria-label="Embaralhar de novo"
            className="w-[52px] h-[52px] rounded-xl border-[1.5px] border-primary-darker bg-surface flex items-center justify-center hover:bg-primary-darker/20 transition-colors cursor-pointer"
          >
            <ArrowPathIcon className="w-5 h-5 text-primary-dark" />
          </button>

          <button
            type="button"
            onClick={() => onAnswer(sentence)}
            className="flex-1 h-[52px] rounded-xl border-[1.5px] flex flex-row items-center justify-center gap-2 font-extrabold text-[15px] transition-all bg-primary border-primary-dark text-black hover:brightness-110 active:scale-[0.98] cursor-pointer"
          >
            <CheckCircleIcon className="w-5 h-5 text-black" />
            Confirmar
          </button>
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div
          className={`mt-2 border-[1.5px] rounded-xl p-3.5 flex flex-row items-start gap-2.5 ${
            isCorrect ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]'
          }`}
        >
          {isCorrect ? (
            <CheckCircleIcon className="w-6 h-6 shrink-0 text-[#4CAF50]" />
          ) : (
            <XCircleIcon className="w-6 h-6 shrink-0 text-[#F44336]" />
          )}
          <div className="flex flex-col gap-1">
            <span className={`font-bold text-sm ${isCorrect ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
              {isCorrect ? 'Frase correta!' : 'A ordem não está certa'}
            </span>
            {!isCorrect && (
              <span className="text-sm text-text-primary">
                Resposta: {words.map((word) => word.text).join(' ')}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
