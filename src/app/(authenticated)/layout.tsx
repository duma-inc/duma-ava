"use client";

import { SessionProvider } from "next-auth/react";
import AppShell from "@/components/layout/AppShell";
import { ExerciseProvider } from "@/store/ExerciseContext";
import { CorrectionProvider } from "@/store/CorrectionContext";
import { FlashcardProvider } from "@/store/FlashcardContext";
import { SkillProfileProvider, useSkillProfile } from "@/store/SkillProfileContext";

function SkillScopedContent({ children }: { children: React.ReactNode }) {
  const { selectedSkill } = useSkillProfile();

  return (
    <ExerciseProvider key={selectedSkill?.id ?? "no-skill"}>
      <CorrectionProvider>
        <FlashcardProvider>
          <AppShell>{children}</AppShell>
        </FlashcardProvider>
      </CorrectionProvider>
    </ExerciseProvider>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SkillProfileProvider>
        <SkillScopedContent>{children}</SkillScopedContent>
      </SkillProfileProvider>
    </SessionProvider>
  );
}
