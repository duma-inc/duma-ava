"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-0 pb-20 lg:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
