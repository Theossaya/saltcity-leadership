import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportStatusBadge } from "@/features/reports/components/report-status-badge";
import type { AdminReportCompanyRow } from "@/features/reports/queries";

type AdminReportCompanyCardProps = {
  row: AdminReportCompanyRow;
};

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminReportCompanyCard({ row }: AdminReportCompanyCardProps) {
  return (
    <Card
      className="rounded-lg border-border/80 bg-card shadow-[0_10px_28px_rgba(21,18,23,0.045)]"
      size="sm"
    >
      <CardHeader className="gap-3 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-base font-semibold">
              {row.company.name}
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {row.leaderName || "No leader assigned"}
            </p>
          </div>
          <ReportStatusBadge status={row.reportStatus} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 rounded-lg text-sm text-muted-foreground">
        <div className="grid gap-2 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 sm:grid-cols-3">
          <p>
            Absentees{" "}
            <span className="block font-medium text-foreground">
              {row.absenteeCount}
            </span>
          </p>
          <p>
            Submitted{" "}
            <span className="block font-medium text-foreground">
              {row.submittedAt ? formatSubmittedAt(row.submittedAt) : "Not submitted"}
            </span>
          </p>
          <p>
            Submitted by{" "}
            <span className="block font-medium text-foreground">
              {row.submittedByName || "No submission"}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
