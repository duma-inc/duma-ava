import api from '../lib/api';
import { NewsArticle, NewsCatalogResponse, NewsCategory } from '../types/news';

type NewsApiArticle = {
  id?: string | number;
  category?: string;
  headline?: string;
  summary?: string;
  highlightedArticle?: boolean;
  source?: string;
  publishedAt?: string;
  content?: string;
};

type RawNewsCatalogResponse =
  | NewsApiArticle[]
  | {
      categories?: string[];
      articles?: NewsApiArticle[];
      items?: NewsApiArticle[];
      data?: NewsApiArticle[];
    };

function normalizeCategory(value?: string): NewsCategory | null {
  if (!value?.trim()) {
    return null;
  }

  return value.trim();
}

function mapNewsArticle(article: NewsApiArticle): NewsArticle | null {
  const id = article.id != null ? String(article.id) : '';
  const category = normalizeCategory(article.category);
  const headline = article.headline?.trim() || '';
  const summary = article.summary?.trim() || '';
  const source = article.source?.trim() || '';
  const publishedAt = article.publishedAt?.trim() || '';
  const content = article.content?.trim() || '';

  if (!id || !category || !headline || !summary || !source || !publishedAt || !content) {
    return null;
  }

  return {
    id,
    category,
    headline,
    summary,
    highlightedArticle: Boolean(article.highlightedArticle),
    source,
    publishedAt,
    content,
  };
}

function extractArticles(payload: RawNewsCatalogResponse): NewsApiArticle[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.articles)) {
    return payload.articles;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export async function fetchNewsCatalog(): Promise<NewsCatalogResponse> {
  const response = await api.get<RawNewsCatalogResponse>('/news');
  const articles = extractArticles(response.data)
    .map(mapNewsArticle)
    .filter((item): item is NewsArticle => Boolean(item));

  const categoriesFromPayload = Array.isArray((response.data as { categories?: string[] })?.categories)
    ? ((response.data as { categories?: string[] }).categories || [])
      .map(normalizeCategory)
      .filter((item): item is string => Boolean(item))
    : [];

  return {
    categories: categoriesFromPayload.length > 0
      ? categoriesFromPayload
      : Array.from(new Set(articles.map((article) => article.category))),
    articles,
  };
}

export async function fetchNewsArticleById(id: string): Promise<NewsArticle> {
  const response = await api.get<NewsApiArticle>(`/news/${id}`);
  const article = mapNewsArticle(response.data);

  if (!article) {
    throw new Error('News article payload is invalid');
  }

  return article;
}
