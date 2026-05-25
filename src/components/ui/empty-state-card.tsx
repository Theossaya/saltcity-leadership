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
    <div className="rounded-card bg-surface p-[18px] shadow-lift">
      <div className={centered ? "mx-auto max-w-sm text-center" : undefined}>
        <h2 className="font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
          {title}
        </h2>
        <div className="mt-2 font-serif text-[13.5px] italic leading-[1.45] text-ink-2 text-pretty">
          {children}
        </div>
      </div>
    </div>
  );
}
