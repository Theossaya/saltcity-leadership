import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import type { LeadershipRole } from "@/features/auth/get-current-user";

type AppShellProps = {
  children: ReactNode;
  displayName: string;
  role: LeadershipRole | null;
  churchName?: string | null;
};

export function AppShell({
  children,
  displayName,
  role,
  churchName,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <AppHeader displayName={displayName} role={role} churchName={churchName} />
      <main className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+8rem)] md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
