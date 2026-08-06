"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  FireIcon,
  SparklesIcon,
  CalendarDaysIcon,
  TrophyIcon,
  ChartBarIcon,
  BellIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import {
  fetchStudyPreferences,
  updateStudyPreferences,
} from "@/services/studyPreferenceService";
import type {
  ExerciseDifficulty,
  WeekDay,
} from "@/types/studyPreference";
import { useExerciseContext } from "@/store/ExerciseContext";

type Aba = "perfil" | "ritmo" | "financeiro";

const ABAS: { id: Aba; label: string; Icon: typeof UserIcon }[] = [
  { id: "perfil", label: "Perfil", Icon: UserIcon },
  { id: "ritmo", label: "Ritmo", Icon: FireIcon },
  { id: "financeiro", label: "Planos", Icon: SparklesIcon },
];

export default function ConfiguracoesPage() {
  const [abaAtiva, setAbaAtiva] = useState<Aba>("perfil");

  return (
    <div className="pb-10 max-w-xl mx-auto w-full">
      <h1 className="text-[22px] font-extrabold text-text-primary mb-5">
        Sua conta
      </h1>

      {/* Tabs */}
      <div className="flex bg-surface rounded-xl p-1 border border-primary-darker gap-1 mb-5">
        {ABAS.map((aba) => {
          const slotAtivo = abaAtiva === aba.id;
          return (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                slotAtivo
                  ? "bg-primary text-black font-bold"
                  : "text-primary-darker/70 hover:text-primary-dark hover:bg-[#1C1C1C]/35"
              }`}
            >
              <aba.Icon className="w-4 h-4" />
              <span>{aba.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content switcher */}
      {abaAtiva === "perfil" && <PerfilTab />}
      {abaAtiva === "ritmo" && <RitmoTab />}
      {abaAtiva === "financeiro" && <FinanceiroTab />}
    </div>
  );
}

/* ── Perfil Tab (leitura do Keycloak via proxy route; edição feita pelo suporte) ── */

const READONLY_INPUT_CLASSES =
  "w-full bg-background border border-primary-darker rounded-lg px-3 py-2.5 text-sm text-text-primary opacity-60 cursor-not-allowed";

function PerfilTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/user-profile");
      if (!res.ok) {
        throw new Error(`Erro ao buscar dados do perfil: ${res.status}`);
      }
      const data = await res.json();
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro de conexão ao carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-surface rounded-xl p-5 border border-primary-darker flex flex-col items-center justify-center min-h-[200px]">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
        <span className="text-xs text-primary-dark font-medium">Buscando perfil...</span>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-5 border border-primary-darker">
      <h3 className="text-base font-bold text-text-primary mb-4">
        Informações pessoais
      </h3>

      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-primary-dark mb-1">
              Nome
            </label>
            <input
              type="text"
              value={firstName}
              disabled
              readOnly
              className={READONLY_INPUT_CLASSES}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary-dark mb-1">
              Sobrenome
            </label>
            <input
              type="text"
              value={lastName}
              disabled
              readOnly
              className={READONLY_INPUT_CLASSES}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-primary-dark mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            readOnly
            className={READONLY_INPUT_CLASSES}
          />
          <p className="text-[11px] text-primary-dark/80 mt-1.5 leading-relaxed">
            O email é o seu identificador de login. Trocá-lo exige nova verificação e um novo acesso à conta.
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary-darker/50">
          <LockClosedIcon className="w-4 h-4 text-primary-dark shrink-0 mt-0.5" />
          <p className="text-[11px] text-primary-dark leading-relaxed">
            Estes dados são somente leitura por aqui. Para corrigir nome, sobrenome ou email, fale com o suporte da Duma.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Ritmo Tab (Study pace selector mirroring mobile layout) ── */
type DiaSemana = "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb" | "Dom";
const DIAS: DiaSemana[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

// Cada meta corresponde a um pace da matrícula (CASUAL, MODERATE, REGULAR, AGGRESSIVE),
// que é quem define a quantidade diária no plano semanal.
type Meta = 10 | 15 | 20 | 30;
const METAS: Meta[] = [10, 15, 20, 30];

type Dificuldade = "Fácil" | "Médio" | "Difícil";
const DIFICULDADES: Dificuldade[] = ["Fácil", "Médio", "Difícil"];

const DIA_TO_WEEKDAY: Record<DiaSemana, WeekDay> = {
  Seg: "MONDAY",
  Ter: "TUESDAY",
  Qua: "WEDNESDAY",
  Qui: "THURSDAY",
  Sex: "FRIDAY",
  Sáb: "SATURDAY",
  Dom: "SUNDAY",
};

const WEEKDAY_TO_DIA = Object.fromEntries(
  Object.entries(DIA_TO_WEEKDAY).map(([dia, weekday]) => [weekday, dia as DiaSemana])
) as Record<WeekDay, DiaSemana>;

const DIFICULDADE_TO_API: Record<Dificuldade, ExerciseDifficulty> = {
  Fácil: "EASY",
  Médio: "MODERATE",
  Difícil: "HARD",
};

const API_TO_DIFICULDADE: Record<ExerciseDifficulty, Dificuldade> = {
  EASY: "Fácil",
  MODERATE: "Médio",
  HARD: "Difícil",
};

function RitmoTab() {
  const { refreshPlan } = useExerciseContext();
  const [diasAtivos, setDiasAtivos] = useState<DiaSemana[]>(["Seg", "Ter", "Qua", "Qui", "Sex"]);
  const [meta, setMeta] = useState<Meta>(10);
  // null = sem preferência de dificuldade; o backend então não filtra por ela.
  const [dificuldade, setDificuldade] = useState<Dificuldade | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        setError(null);
        const { data } = await fetchStudyPreferences();
        setDiasAtivos(
          (data.studyDays || [])
            .map((weekday) => WEEKDAY_TO_DIA[weekday])
            .filter(Boolean)
        );
        if (METAS.includes(data.dailyExerciseGoal as Meta)) {
          setMeta(data.dailyExerciseGoal as Meta);
        }
        setDificuldade(data.difficulty ? API_TO_DIFICULDADE[data.difficulty] : null);
      } catch (err) {
        console.error("[Ritmo] Error loading study preferences:", err);
        // Sem saber o que está gravado, salvar sobrescreveria as preferências reais
        // com os valores padrão da tela.
        setLoadFailed(true);
        setError("Não foi possível carregar suas preferências. Recarregue a página antes de salvar.");
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  function toggleDia(dia: DiaSemana) {
    setDiasAtivos((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  }

  async function handleSave() {
    if (diasAtivos.length === 0) {
      setError("Selecione pelo menos um dia de estudo.");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      await updateStudyPreferences({
        studyDays: diasAtivos.map((dia) => DIA_TO_WEEKDAY[dia]),
        dailyExerciseGoal: meta,
        difficulty: dificuldade ? DIFICULDADE_TO_API[dificuldade] : null,
      });
      // O backend apagou o plano desta semana: recarrega o contexto para que /exercitar
      // não continue mostrando os exercícios antigos que ficaram em memória.
      await refreshPlan();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("[Ritmo] Error saving study preferences:", err);
      setError("Erro ao salvar suas preferências. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-xl p-5 border border-primary-darker flex flex-col items-center justify-center min-h-[200px]">
        <span className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-2" />
        <span className="text-xs text-primary-dark font-medium">Carregando preferências...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dias de estudo */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <CalendarDaysIcon className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Dias de estudo</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {DIAS.map((dia) => {
            const ativo = diasAtivos.includes(dia);
            return (
              <button
                key={dia}
                onClick={() => toggleDia(dia)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer
                  ${
                    ativo
                      ? "bg-primary border-primary text-black"
                      : "bg-[#1C1C1C] border-[#7A4A12]/40 text-primary-dark hover:border-primary"
                  }
                `}
              >
                {dia}
              </button>
            );
          })}
        </div>
        <span className="block text-[11px] text-primary-dark mt-2.5">
          {diasAtivos.length} dia{diasAtivos.length !== 1 ? "s" : ""} selecionado{diasAtivos.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Meta diária */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <TrophyIcon className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Meta diária de exercícios</h3>
        </div>
        <div className="flex gap-2">
          {METAS.map((m) => {
            const ativo = meta === m;
            return (
              <button
                key={m}
                onClick={() => setMeta(m)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center
                  ${
                    ativo
                      ? "bg-primary border-primary text-black"
                      : "bg-[#1C1C1C] border-[#7A4A12]/40 text-primary-dark hover:border-primary"
                  }
                `}
              >
                {m}
              </button>
            );
          })}
        </div>
        <span className="block text-[11px] text-primary-dark mt-2.5">
          Meta atual: {meta} exercícios por dia
        </span>
      </div>

      {/* Dificuldade */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <ChartBarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Nível de dificuldade</h3>
        </div>
        <div className="flex flex-col gap-2">
          {DIFICULDADES.map((d) => {
            const ativo = dificuldade === d;
            const corClass =
              d === "Fácil"
                ? "text-success border-success bg-success/5"
                : d === "Médio"
                ? "text-primary border-primary bg-primary/5"
                : "text-danger border-danger bg-danger/5";

            return (
              <button
                key={d}
                onClick={() => setDificuldade(ativo ? null : d)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer
                  ${
                    ativo
                      ? corClass
                      : "bg-[#1C1C1C] border-[#7A4A12]/40 text-primary-dark hover:border-primary"
                  }
                `}
              >
                <span>{d}</span>
                {ativo && <span className="w-2.5 h-2.5 rounded-full bg-current" />}
              </button>
            );
          })}
        </div>
        <span className="block text-[11px] text-primary-dark mt-2.5">
          {dificuldade
            ? "Toque de novo para voltar a receber exercícios de todos os níveis."
            : "Sem preferência — você recebe exercícios de todos os níveis."}
        </span>
      </div>

      {/* Lembrete — desabilitado até termos envio de email configurado */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-4 shadow-sm opacity-60">
        <div className="flex items-center gap-2 mb-3.5">
          <BellIcon className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Lembrete diário</h3>
          <span className="ml-auto rounded-md border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
            Em breve
          </span>
        </div>
        <button
          disabled
          className="w-full flex items-center justify-between bg-[#1C1C1C] border border-[#7A4A12]/40 rounded-xl p-3.5 text-xs font-bold text-text-primary cursor-not-allowed"
        >
          <span>Notificação às 19h</span>
          <div className="w-10 h-5.5 rounded-full p-0.5 flex items-center bg-primary-darker/35 justify-start">
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
          </div>
        </button>
      </div>

      {/* Salvar */}
      {error && (
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-bold">
          Ritmo atualizado! Seu plano desta semana foi refeito com as novas preferências.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || loadFailed}
        className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold py-2.5 rounded-lg hover:brightness-110 transition-all cursor-pointer text-xs"
      >
        {saving ? "Salvando..." : "Salvar alterações"}
      </button>

      <p className="text-[11px] text-primary-dark/80 text-center leading-relaxed">
        Alterar o ritmo regenera o plano de exercícios da semana atual.
      </p>
    </div>
  );
}

/* ── Financeiro Tab (Pricing options mirroring mobile tiers) ── */
type PlanoId = "lite" | "fast" | "super" | "globalmarket";

const planos = [
  {
    id: "lite" as PlanoId,
    nome: "Lite Mensal",
    preco: "R$ 179,90",
    periodo: "/mês",
    cor: "#A08060",
    destaque: false,
    emBreve: false,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso mensal", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: false },
      { texto: "Encontro de conversação", ativo: true },
      { texto: "Certificação com desconto", ativo: false },
    ],
  },
  {
    id: "fast" as PlanoId,
    nome: "Fast Trimestral",
    preco: "R$ 229,90",
    periodo: "/mês",
    cor: "#EDAA12",
    destaque: false,
    emBreve: false,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso detalhado", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: true },
      { texto: "Encontro de conversação", ativo: false },
      { texto: "Certificação com desconto", ativo: false },
    ],
  },
  {
    id: "super" as PlanoId,
    nome: "Premium Trimestral",
    preco: "R$ 279,90",
    periodo: "/mês",
    cor: "#D88A00",
    destaque: true,
    emBreve: false,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso detalhado", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: true },
      { texto: "Encontro de conversação", ativo: true },
      { texto: "Certificação com desconto", ativo: true },
    ],
  },
  {
    id: "globalmarket" as PlanoId,
    nome: "Global Market",
    preco: "R$ 349,90",
    periodo: "/mês",
    cor: "#FDA91E",
    destaque: false,
    emBreve: false,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso detalhado", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: true },
      { texto: "Encontro de conversação", ativo: true },
      { texto: "Simulação de entrevistas", ativo: true },
      { texto: "Painel de vagas", ativo: true },
      { texto: "Acompanhamento profissional", ativo: true },
    ],
  },
];

function FinanceiroTab() {
  const [selecionado, setSelecionado] = useState<PlanoId>("super");

  return (
    <div className="flex flex-col gap-6">
      {/* Header Diamond */}
      <div className="flex flex-col items-center text-center py-4 bg-[#1C1C1C] border border-primary-darker/60 rounded-2xl p-5 shadow-sm">
        <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
          <SparklesIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black text-text-primary">Planos Duma</h3>
        <p className="text-xs text-primary-dark max-w-xs mt-1.5 leading-relaxed">
          Desbloqueie todo o potencial do seu aprendizado com as assinaturas exclusivas.
        </p>
      </div>

      {/* Plan list */}
      <div className="flex flex-col gap-4">
        {planos.map((plano) => {
          const isSelected = !plano.emBreve && selecionado === plano.id;
          return (
            <div
              key={plano.id}
              onClick={plano.emBreve ? undefined : () => setSelecionado(plano.id)}
              className={`bg-[#1C1C1C] rounded-2xl border transition-all p-5 shadow-md flex flex-col gap-4 relative overflow-hidden
                ${plano.emBreve
                  ? "border-primary-darker opacity-50 cursor-not-allowed"
                  : `cursor-pointer ${isSelected ? "border-primary" : "border-primary-darker hover:border-primary-dark"}`}
              `}
            >
              {plano.emBreve ? (
                <div className="absolute top-0 right-0 bg-primary-darker text-text-primary font-extrabold text-[8px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Em breve
                </div>
              ) : (
                plano.destaque && (
                  <div className="absolute top-0 right-0 bg-primary text-black font-extrabold text-[8px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Destaque
                  </div>
                )
              )}

              {/* Title & selection dot */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text-primary" style={{ color: plano.cor }}>
                  {plano.nome}
                </h4>
                {!plano.emBreve && (
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                      ${isSelected ? "bg-primary border-primary" : "border-primary-darker bg-transparent"}
                    `}
                  >
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-text-primary">{plano.preco}</span>
                <span className="text-xs text-primary-dark">{plano.periodo}</span>
              </div>

              {/* Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-primary-darker/20 pt-4 mt-2">
                {plano.recursos.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {r.ativo ? (
                      <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-primary-darker flex-shrink-0 opacity-40" />
                    )}
                    <span className={r.ativo ? "text-text-primary/95" : "text-primary-darker/60 font-medium"}>
                      {r.texto}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {planos.some((plano) => plano.id === selecionado && !plano.emBreve) && (
        <a
          href="https://duma.app/assinar"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center bg-primary hover:brightness-110 text-black py-3 rounded-xl font-extrabold text-sm transition-all shadow-md block cursor-pointer"
        >
          Assinar {planos.find((p) => p.id === selecionado)?.nome}
        </a>
      )}
    </div>
  );
}
