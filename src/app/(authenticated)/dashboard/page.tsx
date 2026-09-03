"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ProgressBar from "@/components/ui/ProgressBar";
import CardButton from "@/components/ui/CardButton";
import {
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronRightIcon,
  BookOpenIcon,
  SparklesIcon,
  CheckCircleIcon,
  XMarkIcon,
  SquaresPlusIcon,
  Square3Stack3DIcon,
  NewspaperIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useExerciseContext } from "@/store/ExerciseContext";
import { fetchDueFlashcards } from "@/services/flashcardService";
import { fetchMeetingsAgenda } from "@/services/meetingService";
import { AgendaEvent } from "@/components/ui/EventCard";
import MeetingDetailsModal from "@/components/ui/MeetingDetailsModal";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSkillProfile } from "@/store/SkillProfileContext";

interface SkillSummary {
  id: number;
  name: string;
}

/**
 * Por quanto tempo o encontro continua sendo oferecido depois do horário de início.
 * O backend não guarda duração nem horário de término, então essa é a janela de tolerância.
 */
const MEETING_VISIBLE_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Data de hoje no fuso local, no mesmo formato do campo `date` da agenda (YYYY-MM-DD). */
function todayKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Um encontro deixa de ser oferecido quando passa da janela de tolerância. */
function isMeetingOver(event: AgendaEvent, now: number) {
  if (!event.scheduledStart) return false;
  const start = new Date(event.scheduledStart).getTime();
  return Number.isFinite(start) && now > start + MEETING_VISIBLE_WINDOW_MS;
}

interface PlanFeature {
  ativo: boolean;
  texto: string;
}

interface PlanSummary {
  id: number;
  nome: string;
  preco: string;
  destaque?: boolean;
  recursos?: PlanFeature[];
}

export default function DashboardPage() {
  const { enrollments, refreshPlan } = useExerciseContext();
  const { skills, selectedSkill: activeSkill, selectedEnrollment, selectSkill, refreshProfiles } = useSkillProfile();
  const activeSkillId = activeSkill?.id;
  const router = useRouter();
  const { data: session } = useSession();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  // null enquanto carrega, para não piscar o atalho de flashcards
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [stageName, setStageName] = useState("");
  const [todayMeeting, setTodayMeeting] = useState<AgendaEvent | null>(null);
  const [meetingDetails, setMeetingDetails] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansRes] = await Promise.all([
          api.get("/plans"),
        ]);
        setPlans(plansRes.data || []);
      } catch (err) {
        console.error("[Dashboard] Error fetching initial data:", err);
      }
    }
    loadData();
  }, [activeSkillId]);

  useEffect(() => {
    async function loadDueFlashcards() {
      if (!activeSkillId) {
        setDueCount(0);
        return;
      }
      try {
        const { data } = await fetchDueFlashcards();
        setDueCount(data?.length ?? 0);
      } catch (err) {
        console.error("[Dashboard] Error fetching due flashcards:", err);
        setDueCount(0);
      }
    }
    loadDueFlashcards();
  }, [activeSkillId]);

  // O given_name do Keycloak é a fonte de verdade; a sessão serve de valor imediato
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/user-profile");
        if (!res.ok) return;
        const data = await res.json();
        setProfileFirstName((data.firstName as string | undefined)?.trim().split(" ")[0] ?? "");
      } catch (err) {
        console.error("[Dashboard] Error fetching profile:", err);
      }
    }
    loadProfile();
  }, []);

  // Encontro de hoje: a agenda já vem ordenada por horário
  useEffect(() => {
    async function loadTodayMeeting() {
      if (!activeSkillId) {
        setTodayMeeting(null);
        return;
      }
      try {
        const events = await fetchMeetingsAgenda();
        const today = todayKey();
        const now = Date.now();
        setTodayMeeting(
          events.find(
            (event) =>
              event.date === today &&
              event.status !== "CANCELED" &&
              event.status !== "COMPLETED" &&
              !isMeetingOver(event, now)
          ) ?? null
        );
      } catch (err) {
        console.error("[Dashboard] Error fetching today's meeting:", err);
      }
    }
    loadTodayMeeting();
  }, [activeSkillId]);

  // Etapa atual da matrícula ativa, exibida como tag ao lado do nome
  useEffect(() => {
    const stageId = selectedEnrollment?.currentStageId;
    if (!stageId) {
      queueMicrotask(() => setStageName(""));
      return;
    }

    let cancelled = false;
    async function loadStage() {
      try {
        const { data } = await api.get(`/stages/${stageId}`);
        if (!cancelled) setStageName(data?.name ?? "");
      } catch (err) {
        console.error("[Dashboard] Error fetching current stage:", err);
      }
    }
    loadStage();

    return () => {
      cancelled = true;
    };
  }, [selectedEnrollment]);

  const sessionFirstName = session?.user?.name?.trim().split(" ")[0] ?? "";
  const firstName = profileFirstName || sessionFirstName || "Estudante";

  const handleEnroll = async (skillId: number, planId: number) => {
    try {
      setLoadingEnroll(true);
      await api.post(`/enrollments/start`, null, {
        params: { skillId, planId },
      });
      await refreshProfiles();
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
      iconUrl: skill?.iconUrl,
      progress: Math.max(
        0,
        Math.min(100, Math.round(enrollment.progressPercentage ?? 0))
      ),
    };
  });

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-2xl font-extrabold text-text-primary truncate">
            Olá, {firstName}!
          </h1>
          {stageName && (
            <span
              className="shrink-0 rounded-md border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-bold text-primary"
              title="Sua etapa atual"
            >
              {stageName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/flashcards?tab=adicionar"
            className="text-primary-dark hover:text-primary transition-colors cursor-pointer"
            title="Adicionar flashcard"
            aria-label="Adicionar flashcard"
          >
            <SquaresPlusIcon className="w-6 h-6" />
          </Link>
          <Link
            href="/configuracoes"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            <Cog6ToothIcon className="w-6 h-6" />
          </Link>
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

      {/* Encontro do dia — só aparece quando há aula cadastrada para hoje */}
      {todayMeeting && (
        <Card title="Encontro de Hoje" divider className="mb-6">
          <div className="flex items-start gap-2.5 mb-4">
            <VideoCameraIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">
                {todayMeeting.title}
              </p>
              <p className="text-xs text-primary-dark">
                {todayMeeting.badgeLabel} · às {todayMeeting.time}
              </p>
            </div>
          </div>

          <button
            onClick={() => setMeetingDetails(todayMeeting)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:brightness-110 text-text-on-primary font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            <VideoCameraIcon className="w-5 h-5" />
            Detalhes do Encontro
          </button>
        </Card>
      )}

      {/* Atalhos: revisão de flashcards e DumaNews */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <CardButton
          title={
            dueCount && dueCount > 0
              ? `Revisar ${dueCount} flashcard${dueCount > 1 ? "s" : ""}`
              : "Flashcards"
          }
          subtitle={
            dueCount === null
              ? undefined
              : dueCount > 0
                ? "Pendentes de revisão"
                : "Nenhum card para revisão"
          }
          color="#7A4A12"
          icon={<Square3Stack3DIcon className="w-9 h-9" />}
          href="/flashcards?tab=revisar"
        />
        <CardButton
          title="DumaNews"
          subtitle="Notícias da sua skill"
          color="#D88A00"
          icon={<NewspaperIcon className="w-9 h-9" />}
          href="/conteudo/dumanews"
        />
      </div>

      {/* Cursos Matriculados */}
      {enrolledSkillsList.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-text-primary mt-7 mb-3">
            Minhas Skills
          </h2>
          <div className="flex flex-col gap-2.5">
            {enrolledSkillsList.map((curso) => (
              <button
                type="button"
                key={curso.id}
                className="w-full text-left"
                aria-pressed={activeSkill?.id === curso.skillId}
                onClick={() => {
                  selectSkill(curso.skillId);
                  router.push("/exercitar");
                }}
              >
                <div
                  className={`bg-surface rounded-xl p-4 flex items-center gap-3.5 border transition-all duration-200 hover:border-primary-dark hover:scale-[1.01] cursor-pointer ${activeSkill?.id === curso.skillId ? "border-primary" : "border-primary-darker"}`}
                >
                  <span
                    className="rounded-xl p-1 flex items-center justify-center bg-primary/20 shrink-0 w-11 h-11 overflow-hidden"
                  >
                    {curso.iconUrl ? (
                      <img
                        src={curso.iconUrl}
                        alt={curso.title}
                        className="w-9 h-9 object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <BookOpenIcon
                      className={`w-7 h-7 text-primary ${curso.iconUrl ? "hidden" : ""}`}
                    />
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-[15px] font-semibold text-text-primary mb-1.5">
                      {curso.title}
                    </p>
                    <ProgressBar value={curso.progress} />
                    <p className="text-xs text-primary-dark mt-1">
                      {curso.progress}% concluído
                    </p>
                  </div>
                  <ChevronRightIcon
                    className="w-[18px] h-[18px] text-primary ml-2"
                  />
                </div>
              </button>
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
                      {plano.recursos?.map((rec, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircleIcon className={`w-4 h-4 shrink-0 ${rec.ativo ? "text-primary" : "text-primary-dark"}`} />
                          <span className={rec.ativo ? "text-text-primary" : "line-through opacity-50"}>{rec.texto}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => selectedSkill && handleEnroll(selectedSkill.id, plano.id)}
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

      <MeetingDetailsModal
        key={meetingDetails?.id ?? "none"}
        event={meetingDetails}
        onClose={() => setMeetingDetails(null)}
        onCheckedIn={() => {
          setTodayMeeting((current) =>
            current ? { ...current, alreadyCheckedIn: true } : current
          );
          setMeetingDetails((current) =>
            current ? { ...current, alreadyCheckedIn: true } : current
          );
        }}
      />
    </div>
  );
}
