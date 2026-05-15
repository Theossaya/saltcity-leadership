import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  meta?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <section className={cn("grid gap-2 border-l-2 border-primary/20 pl-3", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase text-primary/75">
          {eyebrow}
        </p>
      ) : null}
      <div className="grid gap-2">
        <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {meta ? <div className="flex flex-wrap gap-2">{meta}</div> : null}
    </section>
  );
}
