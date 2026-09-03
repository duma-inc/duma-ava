"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { setApiSkillId } from "@/lib/api";
import { setSpokenContentLanguage } from "@/types/exercise";
import type { EnrollmentResponse } from "@/types/exercise";

const STORAGE_KEY = "@duma_selected_skill_v1";

export interface SkillProfile {
  id: number;
  name: string;
  slug: string;
  contentLocale: string;
  iconUrl?: string | null;
}

interface SkillProfileContextValue {
  skills: SkillProfile[];
  enrollments: EnrollmentResponse[];
  selectedSkill: SkillProfile | null;
  selectedEnrollment: EnrollmentResponse | null;
  isLoading: boolean;
  selectSkill(skillId: number): void;
  refreshProfiles(): Promise<void>;
}

const SkillProfileContext = createContext<SkillProfileContextValue | null>(null);

export function SkillProfileProvider({ children }: { children: React.ReactNode }) {
  const [skills, setSkills] = useState<SkillProfile[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentResponse[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applySelection = useCallback((skillId: number | null) => {
    setSelectedSkillId(skillId);
    setApiSkillId(skillId);
    if (skillId != null) localStorage.setItem(STORAGE_KEY, String(skillId));
  }, []);

  const refreshProfiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const [enrollmentRes, skillsRes] = await Promise.all([
        api.get<EnrollmentResponse[]>("/enrollments/me"),
        api.get<SkillProfile[]>("/skills"),
      ]);
      const active = (enrollmentRes.data || []).filter((item) => item.status === "ACTIVE");
      const availableSkills = skillsRes.data || [];
      setEnrollments(active);
      setSkills(availableSkills);
      const stored = Number(localStorage.getItem(STORAGE_KEY));
      const nextId = active.some((item) => item.skillId === stored) ? stored : active[0]?.skillId ?? null;
      applySelection(nextId);
    } finally {
      setIsLoading(false);
    }
  }, [applySelection]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshProfiles(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshProfiles]);

  const selectedSkill = skills.find((item) => item.id === selectedSkillId) ?? null;
  const selectedEnrollment = enrollments.find((item) => item.skillId === selectedSkillId) ?? null;

  useEffect(() => {
    setSpokenContentLanguage(selectedSkill?.contentLocale || "en-US");
  }, [selectedSkill]);

  const value = useMemo(() => ({
    skills, enrollments, selectedSkill, selectedEnrollment, isLoading,
    selectSkill: (skillId: number) => {
      if (enrollments.some((item) => item.skillId === skillId)) applySelection(skillId);
    },
    refreshProfiles,
  }), [skills, enrollments, selectedSkill, selectedEnrollment, isLoading, applySelection, refreshProfiles]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-primary">Carregando suas skills...</div>;
  }
  return <SkillProfileContext.Provider value={value}>{children}</SkillProfileContext.Provider>;
}

export function useSkillProfile() {
  const context = useContext(SkillProfileContext);
  if (!context) throw new Error("useSkillProfile must be used within SkillProfileProvider");
  return context;
}
