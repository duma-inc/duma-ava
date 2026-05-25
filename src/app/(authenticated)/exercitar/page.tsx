"use client";

import React from 'react';
import { useExerciseContext } from '@/store/ExerciseContext';
import { AcademicCapIcon, CalendarDaysIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import CardButton from '@/components/ui/CardButton';
import Button from '@/components/ui/Button';

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
};

export default function ExercitarPage() {
  const { weeklyPlan, enrollments, isLoading, error } = useExerciseContext();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-primary-dark">Carregando exercícios...</span>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
          <AcademicCapIcon className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary mb-2">Nenhuma Matéria Ativa!</h2>
          <p className="text-text-primary text-sm leading-relaxed mb-6">
            Você ainda não está matriculado em nenhuma skill para exercitar. Escolha uma das nossas matérias disponíveis no Painel para começar a praticar agora mesmo!
          </p>
          <Link href="/dashboard">
            <Button className="px-8 py-2.5 font-bold">Escolher Matéria</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <ExclamationCircleIcon className="w-12 h-12 text-danger" />
        <span className="text-text-primary text-base">{error}</span>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  const days = (weeklyPlan?.dailyPlans ?? []).map((dp) => {
    const date = new Date(dp.date + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const exerciseCount = dp.exercises.length + (dp.reinforcementExercises?.length ?? 0);
    const isAvailable = dp.date <= today;
    const isToday = dp.date === today;

    return {
      dateStr: dp.date,
      title: DAY_NAMES[dayOfWeek] ?? dp.date,
      subtitle: `${exerciseCount} exercícios`,
      color: isToday ? '#EDAA12' : '#7A4A12',
      available: isAvailable,
      isToday,
      status: dp.status,
    };
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full pb-10">
      {/* Card: Teste de nível */}
      { enrollments.length === 0 && (
        <div className="bg-surface rounded-2xl p-4 flex flex-row items-center justify-between border border-primary-darker shadow-sm hover:scale-[1.01] transition-transform cursor-not-allowed opacity-80">
          <div className="flex flex-row items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-text-primary">Teste de nível</span>
              <span className="text-[13px] text-primary-dark mt-0.5">Avalie seu estágio atual no curso.</span>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-[22px] font-extrabold text-text-primary text-center">
        Escolha o dia da semana
      </h2>

      <div className="flex flex-col gap-3">
        {days.map((dia) => (
          dia.available ? (
            <CardButton
              key={dia.dateStr}
              href={`/exercitar/${dia.dateStr}?dayLabel=${encodeURIComponent(dia.title)}`}
              title={dia.isToday ? `${dia.title} (Hoje)` : dia.title}
              subtitle={dia.subtitle}
              color={dia.color}
              icon={<CalendarDaysIcon className="w-9 h-9 text-white" />}
            />
          ) : (
            <CardButton
              key={dia.dateStr}
              title={dia.title}
              subtitle="Em breve"
              color="#3A3A3A"
              icon={<CalendarDaysIcon className="w-9 h-9 text-[#5A5A5A]" />}
              className="opacity-50 cursor-not-allowed"
            />
          )
        ))}
      </div>

      {days.length === 0 && (
        <div className="flex flex-col items-center py-10 gap-3 text-center">
          <CalendarDaysIcon className="w-12 h-12 text-primary-darker" />
          <span className="text-sm text-primary-dark max-w-xs">
            Nenhum plano semanal disponível. Faça uma matrícula para começar.
          </span>
        </div>
      )}
    </div>
  );
}
