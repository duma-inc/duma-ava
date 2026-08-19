"use client";

import { useState } from "react";
import { XMarkIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { AgendaEvent } from "@/components/ui/EventCard";
import { checkInMeeting } from "@/services/meetingService";

interface MeetingDetailsModalProps {
  /** Encontro exibido. `null` fecha o modal. */
  event: AgendaEvent | null;
  onClose: () => void;
  /** Avisa a tela para atualizar a lista dela depois de um check-in bem-sucedido. */
  onCheckedIn?: (meetingId: string) => void;
}

export default function MeetingDetailsModal({
  event,
  onClose,
  onCheckedIn,
}: MeetingDetailsModalProps) {
  const [keyword, setKeyword] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  // Guarda o sucesso local para o bloco trocar na hora, sem depender do pai.
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  // O reset destes estados vem da remontagem: quem renderiza passa key={event?.id}.
  if (!event) return null;

  const alreadyCheckedIn = justCheckedIn || event.alreadyCheckedIn;

  async function handleCheckIn() {
    if (!event || !keyword.trim()) return;

    setCheckinLoading(true);
    setCheckinError(null);
    try {
      await checkInMeeting(event.id, keyword.trim());
      setKeyword("");
      setJustCheckedIn(true);
      onCheckedIn?.(event.id);
    } catch (err: unknown) {
      const response = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      if (response?.status === 409) {
        setCheckinError("Você já confirmou presença neste encontro.");
      } else if (response?.status === 400 && response?.data?.message) {
        setCheckinError(response.data.message);
      } else {
        setCheckinError("Não foi possível registrar sua presença. Tente novamente.");
      }
    } finally {
      setCheckinLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#1C1C1C] border border-[#7A4A12] rounded-2xl shadow-2xl p-6 text-text-primary">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">
            {event.badgeLabel || event.type}
          </span>
          <button
            onClick={onClose}
            className="text-primary-dark hover:text-primary transition-colors p-1 cursor-pointer"
          >
            <XMarkIcon className="w-6.5 h-6.5" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-[#F4E3C1] mb-4">{event.title}</h3>

        {/* Detail lines */}
        <div className="space-y-3 mb-6">
          {/* Horário */}
          <div className="flex items-center gap-2 text-sm text-[#F4E3C1]">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {event.time} {event.duration ? `(${event.duration})` : ""}
            </span>
          </div>

          {/* Data */}
          <div className="flex items-center gap-2 text-sm text-[#F4E3C1]">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {event.date
                ? new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-[#F4E3C1]">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className={`inline-flex px-2 py-0.5 text-xs font-bold rounded text-white ${
                isRunning(event.status)
                  ? "bg-[#2E7D32]"
                  : event.status === "CANCELED"
                  ? "bg-[#C62828]"
                  : "bg-[#7A4A12]"
              }`}
            >
              {formatStatus(event.status)}
            </span>
          </div>
        </div>

        {/* Lição associada */}
        {event.lessonTitle && (
          <div className="bg-[#303030] border border-[#7A4A12]/30 rounded-xl p-3.5 mb-4">
            <span className="block text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">
              Lição Associada
            </span>
            <p className="text-sm font-semibold text-[#F4E3C1]">{event.lessonTitle}</p>
          </div>
        )}

        {/* Descrição */}
        {event.description && (
          <div className="bg-[#303030] rounded-xl p-3.5 mb-6">
            <span className="block text-[11px] font-bold text-primary mb-1 uppercase tracking-wider">
              Descrição
            </span>
            <p className="text-sm text-[#F4E3C1] leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Presença */}
        {alreadyCheckedIn ? (
          <div className="rounded-xl border border-success bg-success/10 px-4 py-3 mb-4 text-sm font-bold text-success">
            Presença confirmada
          </div>
        ) : event.hasAttendanceKeyword && isRunning(event.status) ? (
          <div className="bg-[#303030] border border-[#7A4A12]/30 rounded-xl p-3.5 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Registrar presença
            </p>
            <p className="text-xs text-text-primary/70 mb-3">
              Digite a palavra-chave exibida durante o encontro.
            </p>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCheckIn();
              }}
              placeholder="Palavra-chave"
              maxLength={60}
              className={`w-full bg-[#2A2A2A] border-[1.5px] rounded-xl px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-primary-darker ${
                keyword.trim() ? "border-primary" : "border-[#3A3A3A] focus:border-primary-darker"
              }`}
            />
            {checkinError && (
              <p className="mt-2 text-sm font-semibold text-danger">{checkinError}</p>
            )}
            <button
              onClick={handleCheckIn}
              disabled={!keyword.trim() || checkinLoading}
              className={`mt-3 w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-extrabold text-sm transition-colors ${
                keyword.trim() && !checkinLoading
                  ? "bg-primary text-black hover:bg-primary-dark cursor-pointer"
                  : "bg-[#2A2A2A] text-[#4A4A4A] cursor-not-allowed"
              }`}
            >
              {checkinLoading ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                "Confirmar presença"
              )}
            </button>
          </div>
        ) : null}

        {/* Ações */}
        <div className="flex flex-col gap-2">
          {event.meetingUrl && event.status !== "RECORDED" && (
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:brightness-110 text-black font-bold text-sm rounded-xl transition-all shadow-md"
            >
              <VideoCameraIcon className="w-5 h-5" />
              Participar do Encontro
            </a>
          )}

          {event.recordingUrl && (
            <a
              href={event.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center py-2.5 border border-primary text-primary hover:bg-primary/10 font-bold text-sm rounded-xl transition-all"
            >
              Ver Gravação
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full text-center py-2 text-sm text-[#F4E3C1] hover:brightness-110 cursor-pointer font-medium mt-1"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/** IN_PROGRESS e o valor do backend; STARTED sobrou de dados antigos. */
function isRunning(status?: string) {
  const normalized = status?.toUpperCase();
  return normalized === "IN_PROGRESS" || normalized === "STARTED";
}

export function formatStatus(status?: string) {
  if (!status) return "Agendado";
  switch (status.toUpperCase()) {
    case "SCHEDULED":
      return "Agendado";
    case "IN_PROGRESS":
    case "STARTED":
      return "Em andamento";
    case "COMPLETED":
    case "FINISHED":
      return "Finalizado";
    case "RECORDED":
      return "Gravado";
    case "CANCELED":
      return "Cancelado";
    default:
      return status;
  }
}
