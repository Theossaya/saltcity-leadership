import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PillProps = {
  children: ReactNode;
  tone?: "urgent" | "care" | "ok" | "quiet";
  className?: string;
};

export function Pill({ children, tone = "care", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.12em]",
        tone === "urgent" && "bg-urgent-bg text-urgent",
        tone === "care" && "bg-care-bg text-care",
        tone === "ok" && "bg-ok-bg text-ok",
        tone === "quiet" && "bg-quiet-bg text-quiet",
        className,
      )}
    >
      <span className="size-1.5 rounded-pill bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
