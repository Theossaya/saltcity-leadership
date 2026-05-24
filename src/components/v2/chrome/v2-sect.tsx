import Link from "next/link";
import type { ReactNode } from "react";

type V2SectProps = {
  children: ReactNode;
  action?: string;
  href?: string;
};

export function V2Sect({ children, action, href }: V2SectProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 pt-[22px] pb-2.5">
      <h2 className="font-mono text-[11px] font-bold uppercase leading-none tracking-[0.16em] text-ink-3">
        {children}
      </h2>
      {action && href ? (
        <Link
          href={href}
          className="shrink-0 font-sans text-[11.5px] font-medium text-ink-2"
        >
          {action}
        </Link>
      ) : action ? (
        <span className="shrink-0 font-sans text-[11.5px] font-medium text-ink-3">
          {action}
        </span>
      ) : null}
    </div>
  );
}
