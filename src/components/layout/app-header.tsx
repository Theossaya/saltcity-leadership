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
    <header className="border-b border-border/80 bg-background/95 px-4 py-4">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold text-muted-foreground uppercase">
            {APP_NAME}
          </p>
          <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
            <p className="max-w-[12rem] truncate text-sm font-semibold text-foreground sm:max-w-xs">
              {displayName}
            </p>
            <Badge className="bg-primary text-primary-foreground">
              {formatRole(role)}
            </Badge>
          </div>
          {churchName ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {churchName}
            </p>
          ) : null}
        </div>

        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="h-11 border-border bg-card px-3 text-xs text-muted-foreground hover:text-foreground"
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
