import { Button } from "@/components/v2/primitives/button";
import { Counter } from "@/components/v2/primitives/counter";
import { Field, Select, TextArea } from "@/components/v2/primitives/field";
import { Pill } from "@/components/v2/primitives/pill";
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
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function renderOptionalReportNote(label: string, value: string | null) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-input bg-bg px-3 py-2 shadow-[inset_0_0_0_1px_var(--rule)]">
      <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words font-sans text-[13px] leading-[1.55] text-ink">
        {value}
      </p>
    </div>
  );
}

export function AdminReportCompanyCard({ row }: AdminReportCompanyCardProps) {
  const reviewedAt = row.reviewedAt ? formatSubmittedAt(row.reviewedAt) : null;
  const submittedAt = row.submittedAt
    ? formatSubmittedAt(row.submittedAt)
    : "Not submitted";

  return (
    <section className="rounded-card bg-surface p-[18px] shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink">
            {row.company.name}
          </h3>
          <p className="mt-1 font-sans text-xs font-medium leading-snug text-ink-3">
            {row.leaderName || "No leader assigned"}
          </p>
        </div>
        <ReportStatusBadge status={row.reportStatus} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 rounded-input bg-bg p-3">
        <Counter value={row.absenteeCount} label="Absentees" />
        <Counter value={row.presentCount ?? "—"} label="Present" />
        <Counter value={row.newVisitorsCount ?? "—"} label="Visitors" />
      </div>

      <div className="mt-3 grid gap-2 rounded-input bg-bg p-3 font-sans text-[12px] leading-[1.45] text-ink-3 shadow-[inset_0_0_0_1px_var(--rule)]">
        <p>
          Submitted{" "}
          <span className="font-semibold text-ink">{submittedAt}</span>
        </p>
        <p>
          Submitted by{" "}
          <span className="font-semibold text-ink">
            {row.submittedByName || "No submission"}
          </span>
        </p>
      </div>

      {row.reportId ? (
        <div className="mt-3 grid gap-2">
          {renderOptionalReportNote("General notes", row.generalNotes)}
          {renderOptionalReportNote("Support needed", row.supportNeeded)}
          {renderOptionalReportNote("Testimonies", row.testimonies)}
        </div>
      ) : null}

      {row.canReview && row.reportId ? (
        <form
          action={reviewWeeklyReport}
          className="mt-4 grid gap-3 rounded-card bg-warm-soft p-[18px]"
        >
          <input type="hidden" name="reportId" value={row.reportId} />
          <div>
            <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em] text-warm">
              Review queue
            </p>
            <h4 className="mt-2 font-serif text-[17px] font-medium leading-[1.22] tracking-[-0.008em] text-ink">
              Mark this report reviewed or flagged.
            </h4>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_1fr]">
            <Field htmlFor={`reviewStatus-${row.reportId}`} label="Outcome">
              <Select
                id={`reviewStatus-${row.reportId}`}
                name="reviewStatus"
                defaultValue="reviewed"
              >
                <option value="reviewed">Reviewed</option>
                <option value="flagged">Flagged</option>
              </Select>
            </Field>

            <Field
              htmlFor={`reviewerNotes-${row.reportId}`}
              label="Reviewer notes"
              hint="Required when flagging a report."
            >
              <TextArea
                id={`reviewerNotes-${row.reportId}`}
                name="reviewerNotes"
                maxLength={1500}
                placeholder="Optional unless flagged"
              />
            </Field>
          </div>

          <Button type="submit" variant="ink" className="w-full sm:w-fit">
            Submit review
          </Button>
        </form>
      ) : reviewedAt || row.reviewerNotes ? (
        <div className="mt-4 rounded-card bg-calm-soft p-[18px]">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={row.reportStatus === "flagged" ? "urgent" : "ok"}>
              {row.reportStatus === "flagged" ? "Flagged" : "Reviewed"}
            </Pill>
            {reviewedAt ? (
              <p className="font-sans text-xs font-medium text-ink-3">
                {reviewedAt}
                {row.reviewedByName ? ` by ${row.reviewedByName}` : ""}
              </p>
            ) : null}
          </div>
          {row.reviewerNotes ? (
            <p className="mt-2 whitespace-pre-wrap break-words font-sans text-[13px] leading-[1.55] text-ink-2">
              {row.reviewerNotes}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
