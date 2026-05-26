import { dumaQuizPacks, sentenceBuilderPacks } from "../mocks/games";

export type ContentGameId = "sentence-builder" | "duma-quiz";

export interface ContentGameDefinition {
  id: ContentGameId;
  title: string;
  description: string;
  tag: string;
  imageSrc: string;
  accentColorClass: string;
  accentBackgroundClass: string;
  borderColorClass: string;
  coverClassName: string;
  packCount: number;
}

export const gameCatalog: ContentGameDefinition[] = [
  {
    id: "sentence-builder",
    title: "Sentence Builder",
    description:
      "Monte frases em inglês desembaralhando as palavras. Treine estrutura e fluência semana a semana.",
    tag: "Gramática",
    imageSrc: "/assets/games/sbGame.png",
    accentColorClass: "text-primary",
    accentBackgroundClass: "bg-primary",
    borderColorClass: "border-primary",
    coverClassName: "bg-[radial-gradient(circle_at_top_left,_rgba(253,169,30,0.45),_transparent_35%),linear-gradient(135deg,_#3A2610,_#141414_70%)] text-primary",
    packCount: sentenceBuilderPacks.length,
  },
  {
    id: "duma-quiz",
    title: "Duma Quiz",
    description:
      "Responda perguntas sobre inglês no menor tempo possível. Teste vocabulário, gramática e expressões.",
    tag: "Quiz",
    imageSrc: "/assets/games/DumaQuiz.png",
    accentColorClass: "text-primary-dark",
    accentBackgroundClass: "bg-primary-dark",
    borderColorClass: "border-primary-dark",
    coverClassName: "bg-[radial-gradient(circle_at_top_left,_rgba(216,138,0,0.45),_transparent_35%),linear-gradient(135deg,_#4A2A06,_#141414_70%)] text-primary-dark",
    packCount: dumaQuizPacks.length,
  },
];

export function getGameDefinition(gameId: string) {
  return gameCatalog.find((game) => game.id === gameId);
}
