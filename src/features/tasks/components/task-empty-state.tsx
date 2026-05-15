type TaskEmptyStateProps = {
  title?: string;
  message?: string;
};

export function TaskEmptyState({
  title = "No tasks to show.",
  message = "Leadership tasks that are visible to you will appear here when they are assigned.",
}: TaskEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-[#FBFAF8] px-4 py-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {message}
      </p>
    </div>
  );
}
