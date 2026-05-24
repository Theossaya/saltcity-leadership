import Image from "next/image";
import { Bell, LogOut } from "lucide-react";

import { logout } from "@/features/auth/actions";
import type { LeadershipRole } from "@/features/auth/get-current-user";
import { formatRole } from "@/lib/utils/format-role";

type V2HeadProps = {
  displayName: string;
  role: LeadershipRole | null;
  churchName?: string | null;
};

function shortName(displayName: string) {
  const [first, second] = displayName.trim().split(/\s+/);

  if (!first) {
    return "Leader";
  }

  return second ? `${first} ${second.charAt(0)}.` : first;
}

export function V2Head({ displayName, role, churchName }: V2HeadProps) {
  return (
    <header className="relative z-30 bg-bg px-5 pt-3.5 pb-3">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-3">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[8px] bg-primary">
          <Image
            src="/brand/logo-white.svg"
            alt="SaltCity"
            width={20}
            height={20}
            priority
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-semibold leading-tight tracking-[-0.005em] text-ink">
            {churchName || "SaltCity Central"}
          </p>
          <p className="mt-0.5 truncate font-mono text-[9px] font-medium uppercase leading-tight tracking-[0.16em] text-ink-3">
            <span className="font-semibold text-ink-2">{formatRole(role)}</span>
            <span> · {shortName(displayName)}</span>
          </p>
        </div>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-[10px] text-ink-2 transition-colors hover:bg-bg-tint"
          aria-label="Alerts"
        >
          <Bell className="size-4" strokeWidth={1.7} aria-hidden="true" />
        </button>
        <form action={logout}>
          <button
            type="submit"
            className="flex size-8 items-center justify-center rounded-[10px] text-ink-2 transition-colors hover:bg-bg-tint"
            aria-label="Log out"
          >
            <LogOut className="size-4" strokeWidth={1.7} aria-hidden="true" />
          </button>
        </form>
      </div>
    </header>
  );
}
