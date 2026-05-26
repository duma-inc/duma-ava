"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GradeCard from "@/components/ui/GradeCard";
import MetricBar from "@/components/ui/MetricBar";
import NotificationCard, { NotificationItem } from "@/components/ui/NotificationCard";
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentIcon,
  CalendarIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";

interface DashboardMetrics {
  weeklyGrades: { weekLabel: string; average: number }[];
  skillsScores: { skillId: number; skillName: string; averageScore: number }[];
  metrics: {
    classAttendanceRate: number;
    dailyExercisesPaceRate: number;
    totalExercisesSubmitted: number;
    completedLessonsCount: number;
  };
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-bold text-text-primary mt-7 mb-3">{title}</h2>
  );
}

export default function ProgressoPage() {
  const [metricsData, setMetricsData] = useState<DashboardMetrics | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoadError(null);
      const [metricsRes, notifsRes] = await Promise.all([
        api.get<DashboardMetrics>("/students/me/dashboard-metrics"),
        api.get<NotificationItem[]>("/notifications"),
      ]);

      setMetricsData(metricsRes.data);
      setNotifications(notifsRes.data || []);
    } catch (err: any) {
      console.error("[Progresso] Error fetching data:", err);
      setLoadError(
        err?.response?.status
          ? `Erro ${err.response.status} ao carregar dados de progresso`
          : err?.message || "Erro ao carregar dados de progresso"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const chartData = metricsData?.weeklyGrades && metricsData.weeklyGrades.length > 0
    ? metricsData.weeklyGrades.map((w) => ({ name: w.weekLabel, nota: w.average }))
    : [
        { name: "S1", nota: 0 },
        { name: "S2", nota: 0 },
        { name: "S3", nota: 0 },
        { name: "S4", nota: 0 },
        { name: "S5", nota: 0 },
        { name: "S6", nota: 0 },
      ];

  const metricas = [
    {
      label: "Frequência de Prática",
      value: metricsData?.metrics?.classAttendanceRate ?? 0,
      percent: metricsData?.metrics?.classAttendanceRate ?? 0,
      color: "#FDA91E",
      icon: <AcademicCapIcon className="w-4 h-4 text-[#FDA91E]" />,
      suffix: "%",
    },
    {
      label: "Exercícios Diários",
      value: metricsData?.metrics?.dailyExercisesPaceRate ?? 0,
      percent: metricsData?.metrics?.dailyExercisesPaceRate ?? 0,
      color: "#D88A00",
      icon: <CalendarIcon className="w-4 h-4 text-[#D88A00]" />,
      suffix: "%",
    },
    {
      label: "Exercícios Enviados",
      value: metricsData?.metrics?.totalExercisesSubmitted ?? 0,
      percent: 100,
      color: "#FDA91E",
      icon: <ClipboardDocumentIcon className="w-4 h-4 text-[#FDA91E]" />,
      suffix: "",
    },
    {
      label: "Lessons Concluídas",
      value: metricsData?.metrics?.completedLessonsCount ?? 0,
      percent: 100,
      color: "#D88A00",
      icon: <CheckIcon className="w-4 h-4 text-[#D88A00]" />,
      suffix: "",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-primary-dark">Carregando progresso...</span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-base text-primary-dark mb-1">
        Acompanhe seu desempenho geral
      </p>

      {loadError && (
        <div className="bg-surface rounded-2xl p-4 border border-red-500 text-center text-text-primary text-sm mb-4">
          {loadError}
        </div>
      )}

      {/* Gráfico de evolução */}
      <SectionTitle title="Evolução das Notas" />
      <div className="bg-surface rounded-2xl border border-primary-darker p-4 shadow-md overflow-hidden">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="#7A4A12" strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#D88A00", fontSize: 12 }}
              axisLine={{ stroke: "#7A4A12" }}
            />
            <YAxis
              domain={[0, 10]}
              tick={{ fill: "#D88A00", fontSize: 12 }}
              axisLine={{ stroke: "#7A4A12" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1C1C1C",
                border: "1px solid #7A4A12",
                borderRadius: 12,
                color: "#F4E3C1",
                fontSize: 13,
              }}
            />
            <Line
              type="monotone"
              dataKey="nota"
              stroke="#FDA91E"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#FDA91E", stroke: "#FDA91E", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#FDA91E" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Score por Curso */}
      <SectionTitle title="Score por Matéria" />
      {!metricsData?.skillsScores || metricsData.skillsScores.length === 0 ? (
        <div className="bg-surface rounded-2xl p-6 border border-primary-darker shadow-md text-center text-text-primary text-sm">
          Nenhum score por matéria registrado.
        </div>
      ) : (
        metricsData.skillsScores.map((c) => (
          <GradeCard
            key={c.skillId}
            courseName={c.skillName}
            grade={c.averageScore > 10 ? c.averageScore / 10 : c.averageScore}
            color="#FDA91E"
            icon={<BookOpenIcon className="w-[22px] h-[22px]" style={{ color: "#FDA91E" }} />}
          />
        ))
      )}

      {/* Métricas do Curso */}
      <SectionTitle title="Métricas de Estudo" />
      <div className="bg-surface rounded-2xl p-4 border border-primary-darker shadow-md">
        {metricas.map((m) => (
          <MetricBar
            key={m.label}
            label={m.label}
            value={m.value}
            percent={m.percent}
            color={m.color}
            icon={m.icon}
            suffix={m.suffix}
          />
        ))}
      </div>

      {/* Notificações */}
      <SectionTitle title="Notificações" />
      {notifications.length === 0 ? (
        <div className="bg-surface rounded-2xl p-6 border border-primary-darker shadow-md text-center text-text-primary text-sm">
          Nenhuma notificação recebida.
        </div>
      ) : (
        notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onRead={handleMarkAsRead} />
        ))
      )}
    </div>
  );
}
