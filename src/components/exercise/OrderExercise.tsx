'use client';

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
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
import { ArrowUturnLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Exercise, parseOrderExercise } from '../../types/exercise';
import { shuffleItems } from '../../lib/shuffle';

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

/** Uma palavra do banco. O id e proprio porque a mesma palavra pode repetir na frase. */
interface Word {
  id: string;
  text: string;
}

const ANSWER = 'answer';
const BANK = 'bank';

function WordChip({
  word,
  disabled,
  onClick,
  variant,
}: {
  word: Word;
  disabled: boolean;
  onClick: () => void;
  variant: 'answer' | 'bank';
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: word.id,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const palette =
    variant === 'answer'
      ? 'bg-primary-darker/40 border-primary text-text-primary'
      : 'bg-surface border-primary-darker text-text-primary hover:bg-primary-darker/20';

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      disabled={disabled}
      onClick={onClick}
      {...attributes}
      {...listeners}
      className={`border-[1.5px] rounded-xl px-3.5 py-2 text-[15px] font-bold transition-colors touch-none select-none ${palette} ${
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      {word.text}
    </button>
  );
}

/** Zona que aceita soltar mesmo quando esta vazia. */
function DropZone({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'border-primary' : ''}`}>
      {children}
    </div>
  );
}

/**
 * ORDER: o aluno monta a frase arrastando as palavras embaralhadas do banco para a
 * linha de resposta (e reordenando la dentro). Tocar numa palavra tambem a move —
 * caminho secundario, mais rapido no celular e disponivel se o arraste falhar.
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

  const [bank, setBank] = useState<string[]>(() => shuffleItems(words).map((word) => word.id));
  const [answer, setAnswer] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<UniqueIdentifier | null>(null);

  const byId = useMemo(() => new Map(words.map((word) => [word.id, word])), [words]);
  const sentence = answer.map((id) => byId.get(id)?.text ?? '').join(' ');
  const complete = bank.length === 0 && answer.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function containerOf(id: UniqueIdentifier): typeof ANSWER | typeof BANK | null {
    if (id === ANSWER || id === BANK) return id as typeof ANSWER | typeof BANK;
    if (answer.includes(String(id))) return ANSWER;
    if (bank.includes(String(id))) return BANK;
    return null;
  }

  /** Move a palavra entre o banco e a resposta, inserindo na posicao apontada. */
  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = containerOf(active.id);
    const to = containerOf(over.id);
    if (!from || !to || from === to) return;

    const id = String(active.id);
    const target = to === ANSWER ? answer : bank;
    const overIndex = target.indexOf(String(over.id));
    const insertAt = overIndex === -1 ? target.length : overIndex;

    if (to === ANSWER) {
      setBank((current) => current.filter((item) => item !== id));
      setAnswer((current) => [...current.slice(0, insertAt), id, ...current.slice(insertAt)]);
    } else {
      setAnswer((current) => current.filter((item) => item !== id));
      setBank((current) => [...current.slice(0, insertAt), id, ...current.slice(insertAt)]);
    }
  }

  /** Reordena dentro da mesma lista. */
  function handleDragEnd({ active, over }: DragEndEvent) {
    setDraggingId(null);
    if (!over || active.id === over.id) return;
    const from = containerOf(active.id);
    if (from !== containerOf(over.id)) return;

    const list = from === ANSWER ? answer : bank;
    const setList = from === ANSWER ? setAnswer : setBank;
    const oldIndex = list.indexOf(String(active.id));
    const newIndex = list.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    setList(arrayMove(list, oldIndex, newIndex));
  }

  function moveToAnswer(id: string) {
    setBank((current) => current.filter((item) => item !== id));
    setAnswer((current) => [...current, id]);
  }

  function moveToBank(id: string) {
    setAnswer((current) => current.filter((item) => item !== id));
    setBank((current) => [...current, id]);
  }

  function reset() {
    setAnswer([]);
    setBank(shuffleItems(words).map((word) => word.id));
  }

  const zone =
    'flex flex-row flex-wrap gap-2 min-h-[64px] border-[1.5px] border-dashed rounded-xl p-3 transition-colors';

  return (
    <div className="flex flex-col gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }: DragStartEvent) => setDraggingId(active.id)}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggingId(null)}
      >
        {/* Linha de resposta */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark mb-2">
            Sua frase
          </p>
          <SortableContext items={answer} strategy={rectSortingStrategy}>
            <DropZone id={ANSWER} className={`${zone} border-primary-darker bg-surface/60`}>
              {answer.length === 0 && (
                <span className="text-sm text-primary-darker self-center">
                  Arraste ou toque nas palavras abaixo para montar a frase.
                </span>
              )}
              {answer.map((id) => {
                const word = byId.get(id);
                if (!word) return null;
                return (
                  <WordChip
                    key={id}
                    word={word}
                    variant="answer"
                    disabled={answered}
                    onClick={() => moveToBank(id)}
                  />
                );
              })}
            </DropZone>
          </SortableContext>
        </div>

        {/* Banco de palavras */}
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-dark mb-2">
            Palavras
          </p>
          <SortableContext items={bank} strategy={rectSortingStrategy}>
            <DropZone id={BANK} className={`${zone} border-primary-darker/60`}>
              {bank.length === 0 && (
                <span className="text-sm text-primary-darker self-center">
                  Todas as palavras foram usadas.
                </span>
              )}
              {bank.map((id) => {
                const word = byId.get(id);
                if (!word) return null;
                return (
                  <WordChip
                    key={id}
                    word={word}
                    variant="bank"
                    disabled={answered}
                    onClick={() => moveToAnswer(id)}
                  />
                );
              })}
            </DropZone>
          </SortableContext>
        </div>

        {/* A palavra arrastada segue o cursor */}
        <DragOverlay>
          {draggingId ? (
            <div className="border-[1.5px] border-primary bg-primary-darker/60 rounded-xl px-3.5 py-2 text-[15px] font-bold text-text-primary">
              {byId.get(String(draggingId))?.text}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Acoes */}
      {!answered && (
        <div className="flex flex-row gap-2.5 items-center mt-2">
          <button
            type="button"
            onClick={reset}
            aria-label="Recomeçar"
            className="w-[52px] h-[52px] rounded-xl border-[1.5px] border-primary-darker bg-surface flex items-center justify-center hover:bg-primary-darker/20 transition-colors cursor-pointer"
          >
            <ArrowUturnLeftIcon className="w-5 h-5 text-danger" />
          </button>

          <button
            type="button"
            onClick={() => onAnswer(sentence)}
            disabled={!complete}
            className={`flex-1 h-[52px] rounded-xl border-[1.5px] flex flex-row items-center justify-center gap-2 font-extrabold text-[15px] transition-all ${
              complete
                ? 'bg-primary border-primary-dark text-black hover:brightness-110 active:scale-[0.98] cursor-pointer'
                : 'bg-surface border-[#2A2A2A] text-[#3A3A3A] cursor-not-allowed'
            }`}
          >
            <CheckCircleIcon className={`w-5 h-5 ${complete ? 'text-black' : 'text-[#3A3A3A]'}`} />
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
