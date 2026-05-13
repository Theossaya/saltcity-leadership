import type { ReactNode } from "react";

type CompanyEmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function CompanyEmptyState({ title, children }: CompanyEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-[#FBFAF8] px-4 py-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </div>
  );
}
