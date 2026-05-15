export function FollowUpEmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-[#FBFAF8] px-4 py-6">
      <h2 className="text-base font-semibold text-foreground">
        No absentee follow-up items yet.
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Absentee records that need leadership visibility will appear here after
        reports are prepared.
      </p>
    </div>
  );
}
