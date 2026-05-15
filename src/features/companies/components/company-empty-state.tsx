import type { ReactNode } from "react";

import { EmptyStateCard } from "@/components/ui/empty-state-card";

type CompanyEmptyStateProps = {
  title: string;
  children: ReactNode;
};

export function CompanyEmptyState({ title, children }: CompanyEmptyStateProps) {
  return <EmptyStateCard title={title} centered>{children}</EmptyStateCard>;
}
