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
