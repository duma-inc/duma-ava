"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import ViewToggle, { ViewMode } from "@/components/ui/ViewToggle";
import EventCard, { AgendaEvent } from "@/components/ui/EventCard";
import { fetchMeetingsAgenda } from "@/services/meetingService";

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(sunday);
    nd.setDate(sunday.getDate() + i);
    return nd;
  });
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

function fmt(d: Date): string {
  return d.toISOString().split("T")[0];
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calMonth, setCalMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);

  const selectedStr = useMemo(() => fmt(selectedDate), [selectedDate]);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedStr);
  }, [events, selectedStr]);

  const monthGrid = useMemo(() => getMonthGrid(calMonth.year, calMonth.month), [calMonth]);

  const formattedDate = selectedDate.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  useEffect(() => {
    loadAgenda();
  }, []);

  async function loadAgenda() {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await fetchMeetingsAgenda();
      setEvents(data);
    } catch (err: any) {
      console.error("[Agenda] Error loading meetings:", err);
      setLoadError(
        err?.response?.status
          ? `Erro ${err.response.status} ao carregar a agenda.`
          : err?.message || "Erro de conexão ao carregar a agenda."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function prevMonth() {
    setCalMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  }

  function nextMonth() {
    setCalMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-primary-dark font-medium">Carregando compromissos...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-[22px] font-extrabold text-text-primary mb-3.5">
        Fique por dentro
      </h1>
      <ViewToggle current={viewMode} onChange={setViewMode} />

      {loadError && (
        <div className="bg-[#1C1C1C] border border-danger/30 rounded-2xl p-4 mb-6 flex flex-col gap-3">
          <p className="text-text-primary text-sm font-semibold">{loadError}</p>
          <button
            onClick={loadAgenda}
            className="w-fit text-primary font-bold text-sm cursor-pointer hover:brightness-110"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── Month View ── */}
      {viewMode === "month" && (
        <div>
          <div className="bg-surface rounded-2xl border border-primary-darker shadow-md p-4 mb-6">
            {/* Cabeçalho do mês */}
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-text-primary font-extrabold text-base">
                {MONTH_NAMES[calMonth.month]} {calMonth.year}
              </span>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-darker/40 transition-colors cursor-pointer">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-primary-darker/40 transition-colors cursor-pointer">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Headers dos dias */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((label) => (
                <div key={label} className="text-center text-[10px] font-bold uppercase tracking-tighter text-primary-dark py-1">
                  {label}
                </div>
              ))}
            </div>

            {/* Grid dos dias */}
            {monthGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((date, di) => {
                  if (!date) return <div key={di} />;
                  const key = fmt(date);
                  const isSelected = key === selectedStr;
                  const isToday = fmt(new Date()) === key;
                  const isCurrentMonth = date.getMonth() === calMonth.month;

                  const dayEventsForCell = events.filter((e) => e.date === key);

                  return (
                    <div key={key} className="flex flex-col items-center justify-center py-1">
                      <button
                        onClick={() => setSelectedDate(date)}
                        className={`w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm font-bold transition-all duration-200 cursor-pointer relative
                          ${!isCurrentMonth ? "opacity-30 text-primary-darker" : ""}
                          ${isSelected
                            ? "bg-primary text-black shadow-[0_4px_10px_rgba(253,169,30,0.4)] scale-110"
                            : isToday
                            ? "bg-primary-darker/30 text-primary border border-primary-darker"
                            : isCurrentMonth
                            ? "text-text-primary hover:bg-primary-darker/20"
                            : ""}
                        `}
                      >
                        <span>{date.getDate()}</span>
                        {/* Event indicator dots */}
                        {dayEventsForCell.length > 0 && (
                          <div className="flex gap-0.5 absolute bottom-1 justify-center">
                            {dayEventsForCell.slice(0, 3).map((e) => {
                              const colors: Record<string, string> = {
                                aula: isSelected ? "bg-black" : "bg-[#FDA91E]",
                                encontro: isSelected ? "bg-black" : "bg-[#D88A00]",
                                exercicio: isSelected ? "bg-black" : "bg-[#FDA91E]",
                                teste: isSelected ? "bg-black" : "bg-[#F4E3C1]",
                              };
                              return (
                                <div
                                  key={e.id}
                                  className={`w-1 h-1 rounded-full ${colors[e.type] || "bg-primary"}`}
                                />
                              );
                            })}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-[15px] font-bold text-text-primary capitalize">{formattedDate}</h3>
          </div>
          {dayEvents.length === 0 ? <EmptyState /> : (
            <div className="space-y-1">
              {dayEvents.map((ev) => <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Week View ── */}
      {viewMode === "week" && (
        <div>
          <div className="bg-surface rounded-2xl border border-primary-darker p-4 mb-6 shadow-md">
            <div className="flex justify-between items-center">
              {weekDates.map((date) => {
                const key = fmt(date);
                const active = key === selectedStr;
                const isToday = fmt(new Date()) === key;
                const dayEventsForCell = events.filter((e) => e.date === key);

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDate(date)}
                    className="flex flex-col items-center gap-2 cursor-pointer rounded-full transition-all duration-200 group"
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                      active ? "text-primary" : "text-primary-darker"
                    }`}>
                      {DAY_LABELS[date.getDay()]}
                    </span>
                    <div className={`w-10 h-10 flex flex-col items-center justify-center rounded-full text-sm font-bold transition-all duration-200 relative ${
                      active
                        ? "bg-primary text-black shadow-[0_4px_10px_rgba(253,169,30,0.4)] scale-110"
                        : isToday
                        ? "bg-primary-darker/30 text-primary border border-primary-darker"
                        : "text-text-primary hover:bg-primary-darker/20"
                    }`}>
                      <span>{date.getDate()}</span>
                      {dayEventsForCell.length > 0 && (
                        <div className="flex gap-0.5 absolute bottom-1 justify-center">
                          {dayEventsForCell.slice(0, 3).map((e) => {
                            const colors: Record<string, string> = {
                              aula: active ? "bg-black" : "bg-[#FDA91E]",
                              encontro: active ? "bg-black" : "bg-[#D88A00]",
                              exercicio: active ? "bg-black" : "bg-[#FDA91E]",
                              teste: active ? "bg-black" : "bg-[#F4E3C1]",
                            };
                            return (
                              <div
                                key={e.id}
                                className={`w-1 h-1 rounded-full ${colors[e.type] || "bg-primary"}`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {active && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-[15px] font-bold text-text-primary capitalize">{formattedDate}</h3>
          </div>
          {dayEvents.length === 0 ? <EmptyState /> : (
            <div className="space-y-1">
              {dayEvents.map((ev) => <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Day View ── */}
      {viewMode === "day" && (
        <div>
          <p className="text-[15px] font-semibold text-primary-dark mb-3.5 capitalize">{formattedDate}</p>
          {dayEvents.length === 0 ? (
            <div className="flex flex-col items-center pt-10">
              <CalendarDaysIcon className="w-12 h-12 text-primary-darker" />
              <p className="text-primary-dark mt-2">Nenhum compromisso neste dia</p>
            </div>
          ) : (
            dayEvents.map((ev) => <EventCard key={ev.id} event={ev} onClick={setSelectedEvent} />)
          )}
        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-[#1C1C1C] border border-[#7A4A12] rounded-2xl shadow-2xl p-6 overflow-hidden text-text-primary">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">
                {selectedEvent.badgeLabel || selectedEvent.type}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-primary-dark hover:text-primary transition-colors p-1"
              >
                <XMarkIcon className="w-6.5 h-6.5" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-xl font-extrabold text-[#F4E3C1] mb-4">
              {selectedEvent.title}
            </h3>

            {/* Detail lines */}
            <div className="space-y-3 mb-6">
              {/* Horário */}
              <div className="flex items-center gap-2 text-sm text-[#F4E3C1]">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {selectedEvent.time} {selectedEvent.duration ? `(${selectedEvent.duration})` : ""}
                </span>
              </div>

              {/* Data */}
              <div className="flex items-center gap-2 text-sm text-[#F4E3C1]">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>
                  {selectedEvent.date ? new Date(selectedEvent.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 text-sm text-[#F4E3C1]">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`inline-flex px-2 py-0.5 text-xs font-bold rounded text-white ${
                  selectedEvent.status === 'STARTED' ? 'bg-[#2E7D32]' : selectedEvent.status === 'CANCELED' ? 'bg-[#C62828]' : 'bg-[#7A4A12]'
                }`}>
                  {selectedEvent.status ? formatStatus(selectedEvent.status) : 'Agendado'}
                </span>
              </div>
            </div>

            {/* Lesson Title se houver */}
            {selectedEvent.lessonTitle && (
              <div className="bg-[#303030] border border-[#7A4A12]/30 rounded-xl p-3.5 mb-4">
                <span className="block text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">
                  Lição Associada
                </span>
                <p className="text-sm font-semibold text-[#F4E3C1]">
                  {selectedEvent.lessonTitle}
                </p>
              </div>
            )}

            {/* Descrição se houver */}
            {selectedEvent.description && (
              <div className="bg-[#303030] rounded-xl p-3.5 mb-6">
                <span className="block text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">
                  Descrição
                </span>
                <p className="text-sm text-[#F4E3C1] leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="flex flex-col gap-2">
              {selectedEvent.meetingUrl && selectedEvent.status !== 'RECORDED' && (
                <a
                  href={selectedEvent.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center py-2.5 bg-primary hover:brightness-110 text-black font-bold text-sm rounded-xl transition-all shadow-md"
                >
                  Participar do Encontro
                </a>
              )}

              {selectedEvent.recordingUrl && (
                <a
                  href={selectedEvent.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center py-2.5 border border-primary text-primary hover:bg-primary/10 font-bold text-sm rounded-xl transition-all"
                >
                  Ver Gravação
                </a>
              )}
              
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full text-center py-2 text-sm text-[#F4E3C1] hover:brightness-110 cursor-pointer font-medium mt-1"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatStatus(status?: string) {
  if (!status) return 'Agendado';
  switch (status.toUpperCase()) {
    case 'SCHEDULED':
      return 'Agendado';
    case 'STARTED':
      return 'Em andamento';
    case 'FINISHED':
      return 'Finalizado';
    case 'RECORDED':
      return 'Gravado';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return status;
  }
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center pt-10">
      <CalendarDaysIcon className="w-12 h-12 text-primary-darker" />
      <p className="text-primary-dark mt-2">Nenhum compromisso</p>
    </div>
  );
}
