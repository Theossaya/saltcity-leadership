import type { ReactNode } from "react";

import { EmptyStateCard } from "@/components/ui/empty-state-card";

type ReportEmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function ReportEmptyState({ title, children }: ReportEmptyStateProps) {
  return <EmptyStateCard title={title}>{children}</EmptyStateCard>;
}
