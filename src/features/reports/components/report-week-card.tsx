import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { ReportWeekRange } from "@/features/reports/queries";

type ReportWeekCardProps = {
  week: ReportWeekRange;
};

function formatReportDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function formatReportWeek(week: ReportWeekRange) {
  return `${formatReportDate(week.reportWeekStart)} - ${formatReportDate(
    week.reportWeekEnd,
  )}`;
}

export function ReportWeekCard({ week }: ReportWeekCardProps) {
  return (
    <Card className="rounded-lg border-border/80 bg-[#FBFAF8] shadow-sm" size="sm">
      <CardContent className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#241126] text-white">
          <CalendarDays className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Current report week
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {formatReportWeek(week)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
