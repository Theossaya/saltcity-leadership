import { EmptyStateCard } from "@/components/ui/empty-state-card";

type AnnouncementEmptyStateProps = {
  title?: string;
  message?: string;
};

export function AnnouncementEmptyState({
  title = "No announcements to show.",
  message = "Leadership announcements that are visible to you will appear here.",
}: AnnouncementEmptyStateProps) {
  return (
    <EmptyStateCard title={title}>
      <p>{message}</p>
    </EmptyStateCard>
  );
}
