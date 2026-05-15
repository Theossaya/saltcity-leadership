import type { ReactNode } from "react";

type EmptyStateCardProps = {
  title: string;
  children: ReactNode;
  centered?: boolean;
};

export function EmptyStateCard({
  title,
  children,
  centered = false,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-lg border border-dashed border-primary/20 bg-[#FBFAF8] px-4 py-5 shadow-[0_8px_22px_rgba(21,18,23,0.04)]">
      <div className={centered ? "mx-auto max-w-sm text-center" : undefined}>
        <div
          className={
            centered
              ? "mx-auto mb-3 h-1 w-10 rounded-full bg-primary/25"
              : "mb-3 h-1 w-10 rounded-full bg-primary/25"
          }
        />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="mt-2 text-sm leading-6 text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
