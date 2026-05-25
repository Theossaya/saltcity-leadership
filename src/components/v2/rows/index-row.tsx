import Link from "next/link";
import type { ReactNode } from "react";

import { Pill } from "@/components/v2/primitives/pill";
import { cn } from "@/lib/utils";

type IndexRowProps = {
  index: string;
  title: string;
  description: string;
  href?: string;
  label?: string;
  tone?: "care" | "ok" | "quiet";
  disabled?: boolean;
  icon?: ReactNode;
};

export function IndexRow({
  index,
  title,
  description,
  href,
  label,
  tone = "care",
  disabled = false,
  icon,
}: IndexRowProps) {
  const content = (
    <>
      <span className="w-8 shrink-0 font-mono text-[11px] font-semibold leading-none tracking-[0.04em] text-ink-4">
        {index}
      </span>
      {icon ? (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-input bg-bg-tint text-ink-2">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block font-sans text-[14.5px] font-semibold leading-tight tracking-[-0.005em] text-ink">
          {title}
        </span>
        <span className="mt-1 block font-sans text-xs leading-[1.4] text-ink-3">
          {description}
        </span>
      </span>
      {label ? (
        <span className="shrink-0">
          <Pill tone={tone}>{label}</Pill>
        </span>
      ) : null}
    </>
  );

  const classes = cn(
    "flex min-h-16 items-center gap-3 py-3.5 text-left [&+&]:shadow-[inset_0_1px_0_var(--rule)]",
    disabled && "cursor-not-allowed opacity-70",
  );

  if (!href || disabled) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={href} className={cn(classes, "transition-colors hover:text-ink-2")}>
      {content}
    </Link>
  );
}
