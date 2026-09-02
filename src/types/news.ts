export type NewsCategory = string;

/** Questao de compreensao da noticia. O gabarito vem no payload: a correcao e local. */
export interface NewsQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface NewsArticle {
  id: string;
  category: NewsCategory;
  headline: string;
  summary: string;
  highlightedArticle?: boolean;
  source: string;
  publishedAt: string;
  content: string;
  questions?: NewsQuestion[];
}

export interface NewsCatalogResponse {
  categories: NewsCategory[];
  articles: NewsArticle[];
}
