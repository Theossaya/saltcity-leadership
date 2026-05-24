import { CalendarDays } from "lucide-react";

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
    <section className="flex items-center gap-3 rounded-card bg-surface p-[18px] shadow-lift">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-input bg-primary text-primary-ink">
        <CalendarDays className="size-4" strokeWidth={1.7} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
          Current report week
        </p>
        <p className="mt-1.5 font-sans text-sm font-semibold leading-snug text-ink">
          {formatReportWeek(week)}
        </p>
      </div>
    </section>
  );
}
