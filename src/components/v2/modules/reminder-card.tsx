import type { ReactNode } from "react";

import { Button } from "@/components/v2/primitives/button";
import { Progress } from "@/components/v2/primitives/progress";

type ReminderCardProps = {
  eyebrow: string;
  deadline?: string;
  title: string;
  body: string;
  progress: number;
  progressLabel: string;
  progressMeta: string;
  primaryAction: string;
  primaryHref: string;
  secondaryAction?: string;
  secondaryHref?: string;
  children?: ReactNode;
};

export function ReminderCard({
  eyebrow,
  deadline,
  title,
  body,
  progress,
  progressLabel,
  progressMeta,
  primaryAction,
  primaryHref,
  secondaryAction,
  secondaryHref,
  children,
}: ReminderCardProps) {
  return (
    <section className="overflow-hidden rounded-card bg-warm-soft p-[18px] text-ink">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-warm">
          {eyebrow}
        </p>
        {deadline ? (
          <p className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-warm">
            {deadline}
          </p>
        ) : null}
      </div>
      <h3 className="font-serif text-[21px] font-medium leading-[1.2] tracking-[-0.012em] text-ink text-pretty">
        {title}
      </h3>
      <p className="mt-2 mb-3.5 font-sans text-[13px] leading-[1.55] text-ink-2">
        {body}
      </p>
      <Progress value={progress} />
      <div className="mt-2.5 mb-3.5 flex flex-wrap justify-between gap-x-4 gap-y-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-2">
        <span>{progressLabel}</span>
        <span>{progressMeta}</span>
      </div>
      {children ? <div className="mb-3.5">{children}</div> : null}
      <div className="flex flex-wrap gap-2.5">
        <Button href={primaryHref} variant="ink">
          {primaryAction}
        </Button>
        {secondaryAction && secondaryHref ? (
          <Button href={secondaryHref} variant="soft">
            {secondaryAction}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
