import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FollowUpQueueItem } from "@/features/follow-up/queries";
import {
  ABSENCE_REASON_LABELS,
  FOLLOW_UP_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/lib/constants/statuses";

type FollowUpHistoryCardProps = {
  item: FollowUpQueueItem;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T00:00:00+01:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function getReportStatusLabel(status: string) {
  return (
    REPORT_STATUS_LABELS[status as keyof typeof REPORT_STATUS_LABELS] ??
    "Unknown"
  );
}

export function FollowUpHistoryCard({ item }: FollowUpHistoryCardProps) {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-[0_8px_22px_rgba(21,18,23,0.04)]">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
              {item.companyName}
            </p>
            <CardTitle className="mt-1 text-lg font-semibold">
              {item.memberName}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="h-6 rounded-4xl border-[#C9D8CF] bg-[#F1F7F3] px-2.5 text-[0.7rem] font-semibold uppercase tracking-normal text-[#1D4B31]"
          >
            {FOLLOW_UP_STATUS_LABELS.resolved}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 sm:grid-cols-3 sm:p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {item.contextDateLabel}
            </p>
            <p className="mt-1 font-medium text-foreground">
              {formatDate(item.absenceDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Reason
            </p>
            <p className="mt-1 font-medium text-foreground">
              {ABSENCE_REASON_LABELS[
                item.reason as keyof typeof ABSENCE_REASON_LABELS
              ] ?? "No reason given"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Resolved
            </p>
            <p className="mt-1 font-medium text-foreground">
              {item.resolvedAt ? formatDateTime(item.resolvedAt) : "Recently"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Week {formatDate(item.reportWeekStart)}
          </Badge>
          <Badge variant="outline">
            Report {getReportStatusLabel(item.weeklyReportStatus)}
          </Badge>
          {item.priority ? (
            <Badge variant="outline">
              {TASK_PRIORITY_LABELS[
                item.priority as keyof typeof TASK_PRIORITY_LABELS
              ] ?? "Normal"}
            </Badge>
          ) : null}
          {item.assignedUserName ? (
            <Badge variant="outline">{item.assignedUserName}</Badge>
          ) : null}
          {item.lastContactDate ? (
            <Badge variant="outline">
              Contacted {formatDate(item.lastContactDate)}
            </Badge>
          ) : null}
        </div>

        {item.nextAction || item.notes || item.reasonNote ? (
          <div className="grid gap-3">
            {item.nextAction ? (
              <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
                  Final next action
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.nextAction}
                </p>
              </div>
            ) : null}

            {item.notes ? (
              <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
                  Final notes
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.notes}
                </p>
              </div>
            ) : null}

            {item.reasonNote ? (
              <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
                  Original leader note
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.reasonNote}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
