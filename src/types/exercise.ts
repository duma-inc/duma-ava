export type ExerciseType =
  | 'MULTIPLE_CHOICE'
  | 'TRUE_FALSE'
  | 'TRANSLATION'
  | 'FILL_IN_THE_BLANK'
  | 'MATCHING'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'SPEAKING'
  | 'LISTENING'
  | 'ORDER';

export interface ExerciseOption {
  optionId: string;
  text: string;
  isCorrect: boolean;
  matchKey?: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  skillId: string;
  stageId?: number;
  description: string;
  translation?: string;
  explanation?: string;
  type: ExerciseType;
  difficulty: string;
  language?: string;
  status?: string;
  origin?: string;
  audioUrl?: string;
  options: ExerciseOption[];
}

/** Dia ja entregue pelo aluno: nao pode ser refeito. */
export const DAILY_PLAN_COMPLETED = 'COMPLETED';

/**
 * Dia de descanso: o aluno nao escolheu esse dia da semana em Ritmo, entao o backend cria a
 * entrada vazia (`WeeklyPlanService` precisa dos 7 dias) e nao ha exercicios a fazer.
 */
export const DAILY_PLAN_REST = 'REST';

export interface DailyPlanResponse {
  date: string;
  /** 'PENDING' | 'REST' | 'COMPLETED' */
  status: string;
  exercises: Exercise[];
  reinforcementExercises: Exercise[];
  /** Epoch millis da conclusao; ausente enquanto o dia esta pendente. */
  completedAt?: number | null;
  answeredCount?: number | null;
  correctCount?: number | null;
}

export interface WeeklyPlanResponse {
  id: string;
  studentId: string;
  skillId: string;
  weekStartDate: string;
  weekEndDate: string;
  totalExercises: number;
  status: string;
  dailyPlans: DailyPlanResponse[];
}

export interface EnrollmentResponse {
  id: number;
  userId: string;
  skillId: number;
  currentStageId: number;
  status: string;
  progressPercentage: number;
  source: string;
  pace: string;
  currentLessonId?: string | null;
  planId?: number | null;
  enrolledAt?: string;
}

export interface AttemptPayload {
  lessonId: string;
  exerciseId: string;
  answerGiven: string;
  isCorrect: boolean;
  score: number;
  timeSpentSeconds: number;
}

export interface ExerciseResult {
  exerciseId: string;
  isCorrect: boolean;
  answer: string;
  type: ExerciseType;
}

/** Types that are never considered wrong for retry purposes */
export const NON_RETRYABLE_TYPES: ExerciseType[] = ['ESSAY', 'TRUE_FALSE', 'SHORT_ANSWER', 'SPEAKING'];

/** Types that are never auto-corrected (always isCorrect: true, score: 0) */
export const NON_CORRECTABLE_TYPES: ExerciseType[] = ['ESSAY', 'SHORT_ANSWER', 'SPEAKING'];

/**
 * Idioma do conteudo falado: TTS do LISTENING e reconhecimento de voz do SPEAKING.
 *
 * NAO usar `exercise.language` para isso. Esse campo guarda o idioma DO ALUNO
 * (`pt-BR` em praticamente toda a base) e serve para enunciado e traducao — o que
 * se ouve e se pronuncia e o conteúdo da skill ativa. Usá-lo fazia o leitor
 * narrar o idioma estudado com voz portuguesa.
 */
export let SPOKEN_CONTENT_LANGUAGE = 'en-US';

export function setSpokenContentLanguage(locale: string) {
  SPOKEN_CONTENT_LANGUAGE = locale || 'en-US';
}

/**
 * Tipos cujo corpo ja exibe o enunciado: o header do topo repetiria (SPEAKING,
 * TRANSLATION) ou entregaria por escrito o audio que deveria ser ouvido (LISTENING).
 */
export const TYPES_WITHOUT_PROMPT_HEADER: ExerciseType[] = [
  'LISTENING',
  'TRANSLATION',
  'SPEAKING',
];

/**
 * Tipos que ja mostram o campo `translation` no proprio corpo, dispensando o
 * botao "Ver traducao" do header. Hoje so LISTENING, onde esse campo nao e
 * traducao e sim a pergunta de compreensao.
 *
 * Cuidado ao mexer: em SPEAKING o `translation` e a traducao real da frase
 * (preenchida em 100% da base) e continua util atras do botao.
 */
export const TYPES_WITH_OWN_TRANSLATION: ExerciseType[] = ['LISTENING'];

/** Map backend type to Portuguese label */
export const TYPE_LABELS: Record<ExerciseType, string> = {
  MULTIPLE_CHOICE: 'Múltipla escolha',
  TRUE_FALSE: 'Verdadeiro ou Falso',
  TRANSLATION: 'Tradução',
  FILL_IN_THE_BLANK: 'Complete a lacuna',
  MATCHING: 'Correspondência',
  SHORT_ANSWER: 'Resposta curta',
  ESSAY: 'Redação',
  SPEAKING: 'Pronúncia / Speaking',
  LISTENING: 'Compreensão Auditiva / Listening',
  ORDER: 'Ordenar a frase',
};

/**
 * ORDER (ordenar palavras) nao tem campo proprio no schema: o gabarito mora no
 * mesmo `options` dos demais tipos, com o `matchKey` carregando a posicao — o
 * mesmo overload que MATCHING ja faz com o pareamento.
 *
 *   { text: 'He',   matchKey: '1',   isCorrect: true }  <- palavra na posicao 1
 *   { text: 'is',   matchKey: '2',   isCorrect: true }
 *   { text: 'He is with his wife in Paris', matchKey: 'ALT', isCorrect: true }
 *
 * O banco de palavras que o aluno ve e so a lista de tokens, embaralhada; as
 * opcoes 'ALT' sao ordens alternativas aceitas e nunca aparecem na tela.
 */
export const ORDER_ALT_MATCH_KEY = 'ALT';

/** Le o matchKey aceitando o snake_case que o backend as vezes devolve. */
function readMatchKey(option: ExerciseOption): string {
  return (option.matchKey ?? (option as unknown as { match_key?: string }).match_key ?? '').trim();
}

export interface ParsedOrderExercise {
  /** Palavras do gabarito, ja na ordem correta. */
  tokens: ExerciseOption[];
  /** Frases completas tambem aceitas como corretas. */
  alternatives: string[];
}

export function parseOrderExercise(exercise: Exercise): ParsedOrderExercise {
  const options = exercise.options ?? [];
  const tokens = options
    .filter((option) => /^\d+$/.test(readMatchKey(option)))
    .sort((a, b) => Number(readMatchKey(a)) - Number(readMatchKey(b)));
  const alternatives = options
    .filter((option) => readMatchKey(option).toUpperCase() === ORDER_ALT_MATCH_KEY)
    .map((option) => option.text)
    .filter((text) => Boolean(text?.trim()));
  return { tokens, alternatives };
}

/**
 * Normalizacao usada para comparar a frase montada com o gabarito: minusculas,
 * sem acento, sem pontuacao, espacos colapsados.
 *
 * Precisa concordar com `OrderExerciseSupport.normalize` do duma-backend (usada no
 * teste de nivelamento) e com a copia deste arquivo no duma-mobile — senao o aluno
 * acerta num lugar e erra no outro.
 */
export function normalizeSentence(sentence: string): string {
  return (sentence ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/**
 * Correcao do ORDER: comparacao exata (normalizada) com o gabarito e com cada
 * ordem alternativa. Sem tolerancia difusa de proposito — trocar uma palavra de
 * lugar e exatamente o erro que este exercicio precisa reprovar.
 */
export function isOrderAnswerCorrect(exercise: Exercise, userAnswer: string): boolean {
  const { tokens, alternatives } = parseOrderExercise(exercise);
  if (tokens.length === 0) return false;
  const answer = normalizeSentence(userAnswer);
  if (!answer) return false;
  return [tokens.map((token) => token.text).join(' '), ...alternatives]
    .map(normalizeSentence)
    .includes(answer);
}
