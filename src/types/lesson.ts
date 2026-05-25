export interface LessonChapter {
  id: string;
  title: string;
  summary: string;
  markdown: string;
  order: number;
}

export interface LessonBook {
  id: string;
  lessonId: string;
  title: string;
  subtitle?: string;
  pdfUrl: string;
  chapters: LessonChapter[];
}
