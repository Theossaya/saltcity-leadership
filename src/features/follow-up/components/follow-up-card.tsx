import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  FollowUpQueueItem,
  FollowUpStatus,
} from "@/features/follow-up/queries";
import {
  ABSENCE_REASON_LABELS,
  FOLLOW_UP_STATUS_LABELS,
  REPORT_STATUS_LABELS,
} from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

type FollowUpCardProps = {
  item: FollowUpQueueItem;
};

const followUpStatusClasses: Record<FollowUpStatus, string> = {
  not_started: "border-border bg-white text-muted-foreground",
  open: "border-[#CFC4D4] bg-[#F5F0F7] text-[#241126]",
  assigned: "border-[#C5D1DE] bg-[#F0F4F8] text-[#102033]",
  contacted: "border-[#C9D8CF] bg-[#F1F7F3] text-[#1D4B31]",
  resolved: "border-[#C9D8CF] bg-[#F1F7F3] text-[#1D4B31]",
  escalated: "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T00:00:00+01:00`));
}

function getReportStatusLabel(status: string) {
  return (
    REPORT_STATUS_LABELS[status as keyof typeof REPORT_STATUS_LABELS] ??
    "Unknown"
  );
}

function getFollowUpStatusLabel(status: FollowUpStatus) {
  return status === "not_started"
    ? "Not started"
    : FOLLOW_UP_STATUS_LABELS[
        status as keyof typeof FOLLOW_UP_STATUS_LABELS
      ];
}

export function FollowUpCard({ item }: FollowUpCardProps) {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {item.companyName}
            </p>
            <CardTitle className="mt-1 text-xl font-semibold">
              {item.memberName}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-6 rounded-4xl px-2.5 text-[0.7rem] font-semibold uppercase tracking-normal",
              followUpStatusClasses[item.followUpStatus],
            )}
          >
            {getFollowUpStatusLabel(item.followUpStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Absence date
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
              Report status
            </p>
            <p className="mt-1 font-medium text-foreground">
              {getReportStatusLabel(item.weeklyReportStatus)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Week {formatDate(item.reportWeekStart)}
          </Badge>
          {item.hasFollowUpCase ? (
            <Badge variant="secondary">Case linked</Badge>
          ) : (
            <Badge variant="outline">No case yet</Badge>
          )}
          {item.assignedUserName ? (
            <Badge variant="outline">{item.assignedUserName}</Badge>
          ) : null}
          {item.lastContactDate ? (
            <Badge variant="outline">
              Last contact {formatDate(item.lastContactDate)}
            </Badge>
          ) : null}
        </div>

        {item.reasonNote ? (
          <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Note
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.reasonNote}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
