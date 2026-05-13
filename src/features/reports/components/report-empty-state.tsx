import type { ReactNode } from "react";

type ReportEmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function ReportEmptyState({ title, children }: ReportEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-[#FBFAF8] px-4 py-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
