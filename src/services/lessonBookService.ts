import api from '../lib/api';
import { LessonBook, LessonChapter } from '../types/lesson';

type LessonBookApiResponse = {
  id?: string;
  lessonId?: string;
  title?: string;
  subtitle?: string;
  pdfUrl?: string;
  chapters?: LessonChapterApiResponse[];
};

type LessonChapterApiResponse = {
  id?: string;
  order?: number;
  title?: string;
  summary?: string;
  markdown?: string;
};

function mapChapter(chapter: LessonChapterApiResponse): LessonChapter | null {
  if (!chapter.id || !chapter.title || !chapter.summary || !chapter.markdown || typeof chapter.order !== 'number') {
    return null;
  }

  return {
    id: chapter.id,
    order: chapter.order,
    title: chapter.title,
    summary: chapter.summary,
    markdown: chapter.markdown,
  };
}

function mapLessonBook(item: LessonBookApiResponse): LessonBook | null {
  if (!item.id || !item.lessonId || !item.title) {
    return null;
  }

  return {
    id: item.id,
    lessonId: item.lessonId,
    title: item.title,
    subtitle: item.subtitle || '',
    pdfUrl: item.pdfUrl,
    chapters: (item.chapters || [])
      .map(mapChapter)
      .filter((chapter): chapter is LessonChapter => Boolean(chapter))
      .sort((a, b) => a.order - b.order),
  };
}

export async function fetchLessonBooks(): Promise<LessonBook[]> {
  const response = await api.get<LessonBookApiResponse[]>('/lesson-books');
  return (response.data || [])
    .map(mapLessonBook)
    .filter((item): item is LessonBook => Boolean(item));
}
