import { EmptyStateCard } from "@/components/ui/empty-state-card";

type TaskEmptyStateProps = {
  title?: string;
  message?: string;
};

export function TaskEmptyState({
  title = "No tasks to show.",
  message = "Leadership tasks that are visible to you will appear here when they are assigned.",
}: TaskEmptyStateProps) {
  return (
    <EmptyStateCard title={title}>
      <p>{message}</p>
    </EmptyStateCard>
  );
}
