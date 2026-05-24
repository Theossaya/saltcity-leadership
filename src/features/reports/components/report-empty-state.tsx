import type { ReactNode } from "react";

type ReportEmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function ReportEmptyState({ title, children }: ReportEmptyStateProps) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <h2 className="font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
        {title}
      </h2>
      <div className="mt-2 font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
        {children}
      </div>
    </section>
  );
}
