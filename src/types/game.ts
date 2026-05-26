export interface SentenceBuilderItem {
  id: string;
  prompt: string;
  sentence: string;
}

export interface SentenceBuilderPack {
  id: string;
  title: string;
  weekLabel: string;
  description: string;
  sentences: SentenceBuilderItem[];
}

export interface DumaQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface DumaQuizPack {
  id: string;
  title: string;
  weekLabel: string;
  description: string;
  questions: DumaQuizQuestion[];
}
