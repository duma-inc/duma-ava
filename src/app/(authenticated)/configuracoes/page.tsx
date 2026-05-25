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
} from "@heroicons/react/24/outline";

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

/* ── Perfil Tab (Connected to Keycloak via proxy route) ── */
function PerfilTab() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error(`Erro ao buscar dados do perfil: ${res.status}`);
      }
      const data = await res.json();
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setEmail(data.email || "");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro de conexão ao carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (!res.ok) {
        throw new Error(`Erro ao salvar perfil: ${res.status}`);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Erro de conexão ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  }

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

      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs font-bold">
            Alterações gravadas com sucesso no Keycloak!
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-primary-dark mb-1">
              Nome
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-background border border-primary-darker rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-primary-dark mb-1">
              Sobrenome
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-background border border-primary-darker rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-primary-dark mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background border border-primary-darker rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold py-2.5 rounded-lg hover:brightness-110 transition-all cursor-pointer text-xs"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}

/* ── Ritmo Tab (Study pace selector mirroring mobile layout) ── */
type DiaSemana = "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb" | "Dom";
const DIAS: DiaSemana[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

type Meta = 5 | 10 | 15 | 20 | 30;
const METAS: Meta[] = [5, 10, 15, 20, 30];

type Dificuldade = "Fácil" | "Médio" | "Difícil";
const DIFICULDADES: Dificuldade[] = ["Fácil", "Médio", "Difícil"];

function RitmoTab() {
  const [diasAtivos, setDiasAtivos] = useState<DiaSemana[]>(["Seg", "Ter", "Qua", "Qui", "Sex"]);
  const [meta, setMeta] = useState<Meta>(10);
  const [dificuldade, setDificuldade] = useState<Dificuldade>("Médio");
  const [lembrete, setLembrete] = useState(true);

  function toggleDia(dia: DiaSemana) {
    setDiasAtivos((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
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
                onClick={() => setDificuldade(d)}
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
      </div>

      {/* Lembrete */}
      <div className="bg-surface rounded-2xl border border-primary-darker p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3.5">
          <BellIcon className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-text-primary">Lembrete diário</h3>
        </div>
        <button
          onClick={() => setLembrete(!lembrete)}
          className="w-full flex items-center justify-between bg-[#1C1C1C] border border-[#7A4A12]/40 rounded-xl p-3.5 text-xs font-bold text-text-primary transition-all cursor-pointer hover:border-primary"
        >
          <span>Notificação às 19h</span>
          <div
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 flex items-center
              ${lembrete ? "bg-primary justify-end" : "bg-primary-darker/35 justify-start"}
            `}
          >
            <div className="w-4.5 h-4.5 rounded-full bg-white shadow-sm" />
          </div>
        </button>
      </div>
    </div>
  );
}

/* ── Financeiro Tab (Pricing options mirroring mobile tiers) ── */
type PlanoId = "gratuito" | "basic" | "fast" | "super";

const planos = [
  {
    id: "gratuito" as PlanoId,
    nome: "Gratuito",
    preco: "R$ 0",
    periodo: "para sempre",
    cor: "#A08060",
    destaque: false,
    recursos: [
      { texto: "5 exercícios por dia", ativo: true },
      { texto: "Acesso ao conteúdo básico", ativo: true },
      { texto: "Progresso semanal", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: false },
      { texto: "Conversação diária", ativo: false },
      { texto: "Certificação com desconto", ativo: false },
    ],
  },
  {
    id: "basic" as PlanoId,
    nome: "Basic",
    preco: "R$ 29,90",
    periodo: "/mês",
    cor: "#A08060",
    destaque: false,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso semanal", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: false },
      { texto: "Conversação diária", ativo: false },
      { texto: "Certificação com desconto", ativo: false },
    ],
  },
  {
    id: "fast" as PlanoId,
    nome: "Fast Trimestral",
    preco: "R$ 229,90",
    periodo: "/mês",
    cor: "#FDA91E",
    destaque: false,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso detalhado", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: true },
      { texto: "Conversação diária", ativo: false },
      { texto: "Certificação com desconto", ativo: false },
    ],
  },
  {
    id: "super" as PlanoId,
    nome: "Premium Trimestral",
    preco: "R$ 369,90",
    periodo: "/mês  •  R$ 1779,90/sem",
    cor: "#D88A00",
    destaque: true,
    recursos: [
      { texto: "Exercícios ilimitados", ativo: true },
      { texto: "Todo o conteúdo", ativo: true },
      { texto: "Progresso detalhado", ativo: true },
      { texto: "Aulas semanais ao vivo", ativo: true },
      { texto: "Conversação diária", ativo: true },
      { texto: "Certificação com desconto", ativo: true },
    ],
  },
];

function FinanceiroTab() {
  const [selecionado, setSelecionado] = useState<PlanoId>("gratuito");

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
          const isSelected = selecionado === plano.id;
          return (
            <div
              key={plano.id}
              onClick={() => setSelecionado(plano.id)}
              className={`bg-[#1C1C1C] rounded-2xl border transition-all p-5 shadow-md flex flex-col gap-4 cursor-pointer relative overflow-hidden
                ${isSelected ? "border-primary" : "border-primary-darker hover:border-primary-dark"}
              `}
            >
              {plano.destaque && (
                <div className="absolute top-0 right-0 bg-primary text-black font-extrabold text-[8px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Destaque
                </div>
              )}

              {/* Title & selection dot */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text-primary" style={{ color: plano.cor }}>
                  {plano.nome}
                </h4>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                    ${isSelected ? "bg-primary border-primary" : "border-primary-darker bg-transparent"}
                  `}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                </div>
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
      {selecionado !== "gratuito" && (
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
