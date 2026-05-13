import { Badge } from "@/components/ui/badge";
import type { ReportStatus } from "@/features/reports/queries";
import { REPORT_STATUS_LABELS } from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

type ReportStatusBadgeProps = {
  status: ReportStatus;
};

const statusClasses: Record<ReportStatus, string> = {
  not_started: "border-border bg-white text-muted-foreground",
  draft: "border-[#CFC4D4] bg-[#F5F0F7] text-[#241126]",
  submitted: "border-[#C5D1DE] bg-[#F0F4F8] text-[#102033]",
  reviewed: "border-[#C9D8CF] bg-[#F1F7F3] text-[#1D4B31]",
  flagged: "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]",
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-4xl px-2.5 text-[0.7rem] font-semibold uppercase tracking-normal",
        statusClasses[status],
      )}
    >
      {REPORT_STATUS_LABELS[status]}
    </Badge>
  );
}
