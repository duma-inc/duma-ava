import api from '../lib/api';
import { formatLocalDateKey, getDeviceTimeZone } from '../lib/date';
import { AgendaEvent, EventType } from '../components/ui/EventCard';

interface AgendaMeetingDto {
  id: string;
  title: string;
  description?: string;
  teacherId: string;
  skillId: number;
  stageId: number | null;
  lessonId: string | null;
  lessonTitle?: string;
  planId: number | null;
  meetingUrl?: string;
  scheduledStart: string;
  recordingUrl?: string;
  status: string;
  meetingType: string;
  hasAttendanceKeyword?: boolean;
  alreadyCheckedIn?: boolean;
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
  const res = await api.get<MeetingsAgendaResponse>('/meetings/agenda', {
    params: { timeZone: getDeviceTimeZone() },
  });

  return [...(res.data.meetings || [])]
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
    .map<AgendaEvent>((meeting) => {
      const mappedType = mapMeetingType(meeting.meetingType);

      return {
        id: meeting.id,
        title: meeting.title,
        type: mappedType.type,
        badgeLabel: mappedType.label,
        time: formatTime(meeting.scheduledStart),
        description: meeting.description,
        date: formatLocalDateKey(meeting.scheduledStart),
        scheduledStart: meeting.scheduledStart,
        meetingUrl: meeting.meetingUrl,
        recordingUrl: meeting.recordingUrl,
        status: meeting.status,
        lessonTitle: meeting.lessonTitle,
        hasAttendanceKeyword: meeting.hasAttendanceKeyword,
        alreadyCheckedIn: meeting.alreadyCheckedIn,
      };
    });
}

/** Registra a presenca do aluno a partir da palavra-chave exibida no encontro. */
export async function checkInMeeting(meetingId: string, keyword: string): Promise<void> {
  await api.post(`/meetings/${meetingId}/check-in`, { keyword });
}
