import { EmptyStateCard } from "@/components/ui/empty-state-card";

export function FollowUpEmptyState() {
  return (
    <EmptyStateCard title="No absentee follow-up items yet">
      <p>
        Absentee records that need leadership visibility will appear here after
        reports are prepared.
      </p>
    </EmptyStateCard>
  );
}
