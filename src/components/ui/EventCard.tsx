import Badge from "./Badge";
import {
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { ReactNode } from "react";

export type EventType = "aula" | "encontro" | "exercicio" | "teste";

export interface AgendaEvent {
  id: string;
  title: string;
  type: EventType;
  time: string;
  duration?: string;
  description?: string;
  badgeLabel?: string;
  date?: string;
  meetingUrl?: string;
  recordingUrl?: string;
  status?: string;
}

const typeConfig: Record<
  EventType,
  { color: string; icon: ReactNode; label: string }
> = {
  aula: {
    color: "#FDA91E",
    icon: <AcademicCapIcon className="w-6 h-6" />,
    label: "Aula",
  },
  encontro: {
    color: "#D88A00",
    icon: <UserGroupIcon className="w-6 h-6" />,
    label: "Encontro",
  },
  exercicio: {
    color: "#FDA91E",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    label: "Exercício",
  },
  teste: {
    color: "#F4E3C1",
    icon: <ClipboardDocumentIcon className="w-6 h-6" />,
    label: "Teste",
  },
};

interface EventCardProps {
  event: AgendaEvent;
  onClick?: (event: AgendaEvent) => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const config = typeConfig[event.type];

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`w-full flex bg-surface rounded-xl mb-2.5 overflow-hidden border border-primary-darker shadow-md transition-all duration-200 hover:border-primary-dark ${
        onClick ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]" : ""
      }`}
    >
      {/* Icon strip */}
      <div
        className="flex items-center justify-center w-14 min-h-full"
        style={{ backgroundColor: `${config.color}22`, color: config.color }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 py-3 px-3">
        <Badge color={config.color} className="mb-1">
          {event.badgeLabel || config.label}
        </Badge>
        <p className="text-[15px] font-bold text-text-primary">{event.title}</p>
        {event.description && (
          <p className="text-xs text-primary-dark mt-0.5">
            {event.description}
          </p>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          {event.meetingUrl && event.status !== "RECORDED" && (
            <a
              href={event.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center px-3 py-1 text-[11px] font-bold bg-primary text-black rounded-lg hover:brightness-110 transition-all"
            >
              Participar
            </a>
          )}
          {event.recordingUrl && (
            <a
              href={event.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center px-3 py-1 text-[11px] font-bold border border-primary text-primary rounded-lg hover:bg-primary-darker/20 transition-all"
            >
              Ver Gravação
            </a>
          )}
        </div>
      </div>

      {/* Time */}
      <div className="flex flex-col items-end justify-center pr-3.5 pl-2">
        <span className="text-sm font-bold text-primary">{event.time}</span>
        {event.duration && (
          <span className="text-xs text-primary-dark mt-0.5">
            {event.duration}
          </span>
        )}
      </div>
    </div>
  );
}
