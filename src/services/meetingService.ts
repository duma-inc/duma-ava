import api from '../lib/api';
import { AgendaEvent, EventType } from '../components/ui/EventCard';

interface AgendaMeetingDto {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  skillId: number;
  stageId: number;
  lessonId: string;
  planId: number;
  meetingUrl?: string;
  scheduledStart: string;
  recordingUrl?: string;
  status: string;
  meetingType: string;
}

interface MeetingsAgendaResponse {
  meetings: AgendaMeetingDto[];
}

const meetingTypeMap: Record<string, { type: EventType; label: string }> = {
  PRACTICAL: { type: 'exercicio', label: 'Prática' },
  PRACTICE: { type: 'exercicio', label: 'Prática' },
  GROUP: { type: 'encontro', label: 'Encontro' },
  MENTORING: { type: 'encontro', label: 'Mentoria' },
  TEST: { type: 'teste', label: 'Teste' },
  EXAM: { type: 'teste', label: 'Avaliação' },
  THEORETICAL: { type: 'aula', label: 'Aula' },
  CLASS: { type: 'aula', label: 'Aula' },
};

function formatEnumLabel(value?: string) {
  if (!value) return 'Aula';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapMeetingType(meetingType: string) {
  return meetingTypeMap[meetingType] || { type: 'aula' as EventType, label: formatEnumLabel(meetingType) };
}

function formatTime(dateString: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export async function fetchMeetingsAgenda(): Promise<AgendaEvent[]> {
  const res = await api.get<MeetingsAgendaResponse>('/meetings/agenda');

  return [...(res.data.meetings || [])]
    .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
    .map<AgendaEvent>((meeting) => {
      const mappedType = mapMeetingType(meeting.meetingType);

      return {
        id: meeting.id,
        title: meeting.title,
        type: mappedType.type,
        badgeLabel: mappedType.label,
        time: formatTime(meeting.scheduledStart),
        description: meeting.description,
        date: meeting.scheduledStart.split('T')[0],
        meetingUrl: meeting.meetingUrl,
        recordingUrl: meeting.recordingUrl,
        status: meeting.status,
      };
    });
}
