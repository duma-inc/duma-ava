"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import BorderedCard from "@/components/ui/BorderedCard";
import {
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  CalculatorIcon,
  BookOpenIcon,
  GlobeAltIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useExerciseContext } from "@/store/ExerciseContext";
import api from "@/lib/api";

export default function DashboardPage() {
  const { enrollments, refreshPlan } = useExerciseContext();
  const [skills, setSkills] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [skillsRes, plansRes] = await Promise.all([
          api.get("/skills"),
          api.get("/plans"),
        ]);
        setSkills(skillsRes.data || []);
        setPlans(plansRes.data || []);
      } catch (err) {
        console.error("[Dashboard] Error fetching initial data:", err);
      }
    }
    loadData();
  }, []);

  const handleEnroll = async (skillId: number, planId: number) => {
    try {
      setLoadingEnroll(true);
      await api.post(`/enrollments/start`, null, {
        params: { skillId, planId },
      });
      await refreshPlan();
      setIsModalOpen(false);
      setSelectedSkill(null);
    } catch (err) {
      console.error("[Dashboard] Enrollment failed:", err);
      alert("Erro ao se matricular. Tente novamente.");
    } finally {
      setLoadingEnroll(false);
    }
  };

  const enrolledSkillsList = enrollments.map((enrollment) => {
    const skill = skills.find((s) => s.id === enrollment.skillId);
    return {
      ...enrollment,
      title: skill?.name || `Skill #${enrollment.skillId}`,
      color: "#EDAA12",
    };
  });

  const availableSkillsList = skills.filter(
    (skill) => !enrollments.some((e) => e.skillId === skill.id)
  );

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-text-primary">
          Olá, Estudante!
        </h1>
        <div className="flex items-center gap-4">
          {/* <Link
            href="/configuracoes"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </Link> */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-primary-dark hover:text-danger transition-colors cursor-pointer"
          >
            <ArrowRightStartOnRectangleIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Card Próximo Exercício / Estado Sem Matrículas */}
      {enrollments.length === 0 ? (
        <Card className="mb-6 p-6 border border-primary-dark rounded-xl bg-surface">
          <div className="flex flex-col items-center text-center">
            <SparklesIcon className="w-12 h-12 text-primary mb-3 animate-pulse" />
            <h2 className="text-lg font-bold text-primary mb-2">
              Comece sua Jornada!
            </h2>
            <p className="text-text-primary text-sm max-w-lg mb-4 leading-relaxed">
              Você ainda não possui nenhuma matrícula ativa. Escolha uma das matérias disponíveis abaixo para iniciar o seu aprendizado personalizado com inteligência artificial!
            </p>
          </div>
        </Card>
      ) : (
        <Card title="Seus Estudos de Hoje" divider className="mb-6">
          <p className="text-text-primary text-center mb-4 text-sm">
            Seus exercícios diários personalizados já estão prontos para você treinar!
          </p>
          <Link href="/exercitar">
            <Button className="w-full">Começar Prática</Button>
          </Link>
        </Card>
      )}

      {/* Cursos Matriculados */}
      {enrolledSkillsList.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-text-primary mt-7 mb-3">
            Minhas Skills
          </h2>
          <div className="flex flex-col gap-2.5">
            {enrolledSkillsList.map((curso) => (
              <Link href="/exercitar" key={curso.id} className="w-full">
                <div
                  className="bg-surface rounded-xl p-4 flex items-center gap-3.5 border border-primary-darker transition-all duration-200 hover:border-primary-dark hover:scale-[1.01] cursor-pointer"
                >
                  <span
                    className="rounded-xl p-2.5 flex items-center justify-center bg-primary/20"
                  >
                    <BookOpenIcon
                      className="w-6 h-6 text-primary"
                    />
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] font-semibold text-text-primary mb-1.5">
                      {curso.title}
                    </p>
                    <ProgressBar value={curso.progressPercentage || 0} color={curso.color} />
                    <p className="text-xs text-primary-dark mt-1">
                      {curso.progressPercentage || 0}% concluído
                    </p>
                  </div>
                  <ChevronRightIcon
                    className="w-[18px] h-[18px] text-primary ml-2"
                  />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Cursos Disponíveis - Temporariamente desativado*/}
      {/*availableSkillsList.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-text-primary mt-6 mb-3">
            Matérias Disponíveis
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableSkillsList.map((curso) => (
              <BorderedCard
                key={curso.id}
                title={curso.name}
                color="#EDAA12"
                icon={
                  <GlobeAltIcon
                    className="w-7 h-7 text-primary"
                  />
                }
                onClick={() => {
                  setSelectedSkill(curso);
                  setIsModalOpen(true);
                }}
              />
            ))}
          </div>
        </>
      )*/}

      {/* Modal Premium de Seleção de Planos */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-primary/30 rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Fechar */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSkill(null);
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-primary">Escolha o Plano Ideal</h3>
              <p className="text-xs text-text-secondary mt-1">
                Matricule-se em: <span className="font-semibold text-text-primary">{selectedSkill?.name}</span>
              </p>
            </div>

            {loadingEnroll ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm text-text-secondary mt-3">Realizando matrícula...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {plans.map((plano) => (
                  <div
                    key={plano.id}
                    className={`bg-background/40 border rounded-xl p-4 relative transition-all duration-200 ${
                      plano.destaque ? "border-primary shadow-lg shadow-primary/5" : "border-primary-darker hover:border-primary-dark"
                    }`}
                  >
                    {plano.destaque && (
                      <span className="absolute -top-2.5 right-4 bg-primary text-[10px] font-extrabold text-background px-2 py-0.5 rounded-full">
                        MELHOR ESCOLHA
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-text-primary">{plano.nome}</h4>
                    <p className="text-lg font-extrabold text-primary mt-1">{plano.preco}</p>

                    <ul className="mt-3 space-y-1.5 text-xs text-text-secondary">
                      {plano.recursos?.map((rec: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircleIcon className={`w-4 h-4 shrink-0 ${rec.ativo ? "text-primary" : "text-primary-dark"}`} />
                          <span className={rec.ativo ? "text-text-primary" : "line-through opacity-50"}>{rec.texto}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleEnroll(selectedSkill?.id, plano.id)}
                      className="w-full mt-4 py-1.5 text-xs font-bold"
                    >
                      Iniciar Matrícula
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSkill(null);
              }}
              className="w-full text-center text-xs font-semibold text-primary hover:text-primary-dark transition-colors mt-4 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
