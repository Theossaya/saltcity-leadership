import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviewWeeklyReport } from "@/features/reports/actions";
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

function renderOptionalReportNote(label: string, value: string | null) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border/80 bg-white px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

export function AdminReportCompanyCard({ row }: AdminReportCompanyCardProps) {
  const reviewedAt = row.reviewedAt ? formatSubmittedAt(row.reviewedAt) : null;

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
      <CardContent className="grid gap-3 rounded-lg text-sm text-muted-foreground">
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

        {row.reportId ? (
          <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <p>
                Total{" "}
                <span className="block font-medium text-foreground">
                  {row.totalMembers ?? 0}
                </span>
              </p>
              <p>
                Present{" "}
                <span className="block font-medium text-foreground">
                  {row.presentCount ?? 0}
                </span>
              </p>
              <p>
                Absent{" "}
                <span className="block font-medium text-foreground">
                  {row.absentCount ?? 0}
                </span>
              </p>
              <p>
                Visitors{" "}
                <span className="block font-medium text-foreground">
                  {row.newVisitorsCount ?? 0}
                </span>
              </p>
            </div>

            {renderOptionalReportNote("General notes", row.generalNotes)}
            {renderOptionalReportNote("Support needed", row.supportNeeded)}
            {renderOptionalReportNote("Testimonies", row.testimonies)}
          </div>
        ) : null}

        {row.canReview && row.reportId ? (
          <form
            action={reviewWeeklyReport}
            className="grid gap-3 rounded-lg border border-primary/15 bg-[#F1ECE6] p-3"
          >
            <input type="hidden" name="reportId" value={row.reportId} />

            <div className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_1fr]">
              <div className="grid gap-2">
                <Label htmlFor={`reviewStatus-${row.reportId}`}>Outcome</Label>
                <select
                  id={`reviewStatus-${row.reportId}`}
                  name="reviewStatus"
                  defaultValue="reviewed"
                  className="h-12 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`reviewerNotes-${row.reportId}`}>
                  Reviewer notes
                </Label>
                <Textarea
                  id={`reviewerNotes-${row.reportId}`}
                  name="reviewerNotes"
                  maxLength={1500}
                  className="min-h-24 bg-background"
                  placeholder="Optional unless flagged"
                />
              </div>
            </div>

            <div className="border-t border-border/80 pt-1">
              <Button
                type="submit"
                className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
              >
                Submit review
              </Button>
            </div>
          </form>
        ) : reviewedAt || row.reviewerNotes ? (
          <div className="grid gap-2 rounded-lg border border-primary/15 bg-[#F1ECE6] p-3">
            <p className="font-medium text-foreground">
              {row.reportStatus === "flagged" ? "Flagged" : "Reviewed"}
            </p>
            {reviewedAt ? (
              <p>
                {row.reportStatus === "flagged" ? "Flagged" : "Reviewed"}{" "}
                {reviewedAt}
                {row.reviewedByName ? ` by ${row.reviewedByName}` : ""}
              </p>
            ) : null}
            {row.reviewerNotes ? (
              <p className="leading-6 text-foreground">{row.reviewerNotes}</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
