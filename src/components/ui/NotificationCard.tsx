import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'TUTOR_FEEDBACK' | 'EXERCISE_SUBMITTED' | 'TEST_COMPLETED' | 'GENERAL';
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCardProps {
  notification: NotificationItem;
  onRead?: (id: string) => void;
}

const typeConfig: Record<
  NotificationItem['type'],
  { Icon: any; color: string; bg: string }
> = {
  TUTOR_FEEDBACK: { Icon: ChatBubbleLeftRightIcon, color: '#FDA91E', bg: '#FDA91E22' },
  EXERCISE_SUBMITTED: { Icon: CheckCircleIcon, color: '#4CAF50', bg: '#4CAF5022' },
  TEST_COMPLETED: { Icon: SparklesIcon, color: '#9C27B0', bg: '#9C27B022' },
  GENERAL: { Icon: InformationCircleIcon, color: '#2196F3', bg: '#2196F322' },
};

export default function NotificationCard({ notification, onRead }: NotificationCardProps) {
  const config = typeConfig[notification.type] || typeConfig.GENERAL;
  const { Icon, color, bg } = config;
  const date = new Date(notification.createdAt);
  const dateStr = !isNaN(date.getTime())
    ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    : '';

  return (
    <div
      onClick={() => !notification.isRead && onRead?.(notification.id)}
      className={`bg-surface rounded-xl p-4 mb-2.5 border border-primary-darker shadow-md transition-all ${
        !notification.isRead ? 'cursor-pointer hover:border-primary-light' : 'opacity-70'
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: notification.isRead ? '#555' : color }}
    >
      <div className="flex items-center mb-2 gap-2">
        <span
          className="rounded-full p-1.5 flex items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color }} />
        </span>
        <span className="flex-1 text-sm font-bold text-text-primary">
          {notification.title}
        </span>
        <span className="text-xs text-primary-dark">{dateStr}</span>
      </div>
      <p className="text-sm text-text-primary leading-5">{notification.message}</p>
    </div>
  );
}
