import { SessionProvider } from "next-auth/react";
import AppShell from "@/components/layout/AppShell";
import { ExerciseProvider } from "@/store/ExerciseContext";
import { FlashcardProvider } from "@/store/FlashcardContext";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ExerciseProvider>
        <FlashcardProvider>
          <AppShell>{children}</AppShell>
        </FlashcardProvider>
      </ExerciseProvider>
    </SessionProvider>
  );
}
