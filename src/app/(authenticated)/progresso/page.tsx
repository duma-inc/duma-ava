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
import FeedbackCard, { Feedback } from "@/components/ui/FeedbackCard";
import {
  BookOpenIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";
import { useExerciseContext } from "@/store/ExerciseContext";
import api from "@/lib/api";

// ── Feedbacks ──
const feedbacks: Feedback[] = [
  { id: "1", author: "Teacher Matheus", text: "Vamos pra cima. Só pare quando estiver fluente!", date: "02/05", sentiment: "positive" },
];

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-bold text-text-primary mt-7 mb-3">{title}</h2>
  );
}

export default function ProgressoPage() {
  const { enrollments } = useExerciseContext();
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        const res = await api.get("/skills");
        setSkills(res.data || []);
      } catch (err) {
        console.error("[Progresso] Error fetching skills:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, []);

  // Cross skills with user enrollments
  const mappedCursos = skills.map((skill) => {
    const enrollment = enrollments.find((e) => e.skillId === skill.id);
    const progress = enrollment ? enrollment.progressPercentage || 0 : 0;
    const grade = progress / 10;

    return {
      id: skill.id,
      name: skill.name,
      grade,
      color: enrollment ? "#FDA91E" : "#7A4A12",
    };
  });

  // Dynamically calculate metrics
  const completedCount = enrollments.filter(e => e.status === "COMPLETED").length;
  const activeCount = enrollments.filter(e => e.status === "ACTIVE").length;
  const totalExercisesPercent = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + (curr.progressPercentage || 0), 0) / enrollments.length)
    : 0;

  const metricas = [
    { label: "Frequência de Prática", value: enrollments.length > 0 ? 95 : 0, color: "#FDA91E" },
    { label: "Exercícios Diários", value: totalExercisesPercent, color: "#D88A00" },
    { label: "Matérias Ativas", value: activeCount > 0 ? 100 : 0, color: "#FDA91E" },
    { label: "Matérias Concluídas", value: completedCount > 0 ? 100 : 0, color: "#D88A00" },
  ];

  const chartData = enrollments.length > 0
    ? [
        { name: "S1", nota: 5.0 },
        { name: "S2", nota: 5.5 },
        { name: "S3", nota: 6.0 },
        { name: "S4", nota: 7.0 },
        { name: "S5", nota: (totalExercisesPercent / 10) || 5.0 },
        { name: "S6", nota: (totalExercisesPercent / 10) || 5.0 },
      ]
    : [
        { name: "S1", nota: 0 },
        { name: "S2", nota: 0 },
        { name: "S3", nota: 0 },
        { name: "S4", nota: 0 },
        { name: "S5", nota: 0 },
        { name: "S6", nota: 0 },
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
      {mappedCursos.length === 0 ? (
        <div className="bg-surface rounded-2xl p-6 border border-primary-darker shadow-md text-center text-text-primary text-sm">
          Nenhuma matéria cadastrada no sistema.
        </div>
      ) : (
        mappedCursos.map((c) => (
          <GradeCard
            key={c.id}
            courseName={c.name}
            grade={c.grade}
            color={c.color}
            icon={<BookOpenIcon className="w-[22px] h-[22px]" style={{ color: c.color }} />}
          />
        ))
      )}

      {/* Métricas do Curso */}
      {/*<SectionTitle title="Métricas de Estudo" />
      <div className="bg-surface rounded-2xl p-4 border border-primary-darker shadow-md">
        {metricas.map((m, i) => (
          <MetricBar
            key={m.label}
            label={m.label}
            value={m.value}
            color={m.color}
            icon={
              [
                <AcademicCapIcon key="0" className="w-4 h-4" style={{ color: m.color }} />,
                <FolderOpenIcon key="1" className="w-4 h-4" style={{ color: m.color }} />,
                <svg key="2" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={m.color} strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>,
                <ClipboardDocumentIcon key="3" className="w-4 h-4" style={{ color: m.color }} />,
              ][i]
            }
          />
        ))}
      </div>*/}

      {/* Feedbacks */}
      <SectionTitle title="Feedbacks" />
      {feedbacks.map((f) => (
        <FeedbackCard key={f.id} feedback={f} />
      ))}
    </div>
  );
}
