import { useState, useEffect, useCallback } from "react";

export function useLessonProgress() {
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("duma_completed_chapters");
      if (stored) {
        try {
          setCompletedChapters(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const saveToStorage = (list: string[]) => {
    localStorage.setItem("duma_completed_chapters", JSON.stringify(list));
    setCompletedChapters(list);
  };

  const isCompleted = useCallback(
    (chapterId: string) => completedChapters.includes(chapterId),
    [completedChapters]
  );

  const toggleCompleted = useCallback(
    (chapterId: string) => {
      const updated = completedChapters.includes(chapterId)
        ? completedChapters.filter((id) => id !== chapterId)
        : [...completedChapters, chapterId];
      saveToStorage(updated);
    },
    [completedChapters]
  );

  const setCompleted = useCallback(
    (chapterId: string, value: boolean) => {
      const isAlready = completedChapters.includes(chapterId);
      if (value && !isAlready) {
        saveToStorage([...completedChapters, chapterId]);
      } else if (!value && isAlready) {
        saveToStorage(completedChapters.filter((id) => id !== chapterId));
      }
    },
    [completedChapters]
  );

  return {
    isCompleted,
    toggleCompleted,
    setCompleted,
    completedChapters,
  };
}
