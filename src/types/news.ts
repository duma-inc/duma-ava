export type NewsCategory = string;

export interface NewsArticle {
  id: string;
  category: NewsCategory;
  headline: string;
  summary: string;
  highlightedArticle?: boolean;
  source: string;
  publishedAt: string;
  content: string;
}

export interface NewsCatalogResponse {
  categories: NewsCategory[];
  articles: NewsArticle[];
}
