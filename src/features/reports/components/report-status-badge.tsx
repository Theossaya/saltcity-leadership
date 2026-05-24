import { Pill } from "@/components/v2/primitives/pill";
import type { ReportStatus } from "@/features/reports/queries";
import { REPORT_STATUS_LABELS } from "@/lib/constants/statuses";

type ReportStatusBadgeProps = {
  status: ReportStatus;
};

const statusTone: Record<ReportStatus, "urgent" | "care" | "ok" | "quiet"> = {
  not_started: "quiet",
  draft: "quiet",
  submitted: "care",
  reviewed: "ok",
  flagged: "urgent",
};

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return <Pill tone={statusTone[status]}>{REPORT_STATUS_LABELS[status]}</Pill>;
}
