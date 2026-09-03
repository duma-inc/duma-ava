import api from "@/lib/api";

export interface StudentGame {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  skillId: number;
  type: "EMBED" | "NATIVE";
  embedUrl?: string | null;
  nativeKind?: "QUIZ" | "MEMORY" | "SCRAMBLE" | "SENTENCE_BUILDER" | "WORD_MATCH" | null;
  payload?: unknown;
  thumbnailUrl?: string | null;
}

export async function fetchStudentGames(): Promise<StudentGame[]> {
  const { data } = await api.get<StudentGame[]>("/games/student");
  return data || [];
}

export async function fetchStudentGame(id: string): Promise<StudentGame> {
  const { data } = await api.get<StudentGame>(`/games/student/${id}`);
  return data;
}
