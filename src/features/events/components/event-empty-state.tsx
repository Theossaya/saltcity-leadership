import { EmptyStateCard } from "@/components/ui/empty-state-card";

type EventEmptyStateProps = {
  title?: string;
  message?: string;
};

export function EventEmptyState({
  title = "No events to show.",
  message = "Leadership events that are visible to you will appear here.",
}: EventEmptyStateProps) {
  return (
    <EmptyStateCard title={title}>
      <p>{message}</p>
    </EmptyStateCard>
  );
}
