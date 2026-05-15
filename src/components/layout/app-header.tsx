import { LogOut } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";
import type { LeadershipRole } from "@/features/auth/get-current-user";
import { APP_NAME } from "@/lib/constants/app";
import { formatRole } from "@/lib/utils/format-role";

type AppHeaderProps = {
  displayName: string;
  role: LeadershipRole | null;
  churchName?: string | null;
};

export function AppHeader({ displayName, role, churchName }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_rgba(36,17,38,0.14)]">
            LA
          </div>
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold text-muted-foreground uppercase">
              {APP_NAME}
            </p>
            <div className="mt-0.5 flex min-w-0 items-center gap-2">
              <p className="max-w-[9.5rem] truncate text-sm font-semibold text-foreground sm:max-w-xs">
                {displayName}
              </p>
              <Badge className="h-5 shrink-0 rounded-4xl border border-border/70 bg-[#FBFAF8] px-2 text-[0.65rem] font-semibold text-secondary-foreground">
                {formatRole(role)}
              </Badge>
            </div>
            {churchName ? (
              <p className="mt-0.5 max-w-[13rem] truncate text-xs text-muted-foreground sm:max-w-sm">
                {churchName}
              </p>
            ) : null}
          </div>
        </div>

        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            size="icon-lg"
            className="border-border/90 bg-card text-muted-foreground shadow-sm hover:text-foreground sm:w-auto sm:px-3"
            aria-label="Log out"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
