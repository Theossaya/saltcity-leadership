import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Button } from "@/components/v2/primitives/button";
import { Counter } from "@/components/v2/primitives/counter";
import { Field, Select, TextArea, TextInput } from "@/components/v2/primitives/field";
import { MemberChip } from "@/components/v2/primitives/member-chip";
import { Pill } from "@/components/v2/primitives/pill";
import { Progress } from "@/components/v2/primitives/progress";
import { StepRail } from "@/components/v2/primitives/step-rail";
import { getCurrentUser } from "@/features/auth/get-current-user";
import {
  addAbsenteeRecord,
  removeAbsenteeRecord,
  startWeeklyReportDraft,
  submitWeeklyReport,
  updateDraftWeeklyReport,
} from "@/features/reports/actions";
import { AdminReportCompanyCard } from "@/features/reports/components/admin-report-company-card";
import { ReportEmptyState } from "@/features/reports/components/report-empty-state";
import { ReportStatusBadge } from "@/features/reports/components/report-status-badge";
import {
  formatReportWeek,
  ReportWeekCard,
} from "@/features/reports/components/report-week-card";
import {
  getAdminReportsOverview,
  getCompanyReportWorkspace,
  getCurrentReportWeek,
  type AbsenteeRecordSummary,
  type AdminReportCompanyRow,
  type CompanyMemberOption,
  type ReportStatus,
  type ReportWeekRange,
  type WeeklyReportSummary,
} from "@/features/reports/queries";
import {
  ABSENCE_REASON_LABELS,
  ABSENCE_REASONS,
  REPORT_STATUS_LABELS,
} from "@/lib/constants/statuses";

type ReportsPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    reviewed?: string | string[];
    flagged?: string | string[];
    submitted?: string | string[];
    updated?: string | string[];
  }>;
};

const REGULAR_SERVICE_DAYS = [
  { day: 0, startHour: 9, startMinute: 0 },
  { day: 3, startHour: 17, startMinute: 0 },
  { day: 5, startHour: 17, startMinute: 0 },
];

function getCompanyStatusCopy(status: ReportStatus) {
  switch (status) {
    case "draft":
      return {
        title: "Draft report in progress.",
        cta: "Continue report",
      };
    case "submitted":
      return {
        title: "Report submitted and awaiting review.",
        cta: "View report",
      };
    case "reviewed":
      return {
        title: "Report reviewed.",
        cta: "View report",
      };
    case "flagged":
      return {
        title: "Report needs attention.",
        cta: "View report",
      };
    case "not_started":
    default:
      return {
        title: "No report started for this week.",
        cta: "Start report",
      };
  }
}

function formatSubmittedDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatAbsenceDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T00:00:00+01:00`));
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getLagosNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone: "Africa/Lagos",
    year: "numeric",
  }).formatToParts(new Date());
  const value = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);

  return new Date(
    Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour"),
      value("minute"),
    ),
  );
}

function getDefaultAbsenceDate(weekStart: string, weekEnd: string) {
  const startDate = new Date(`${weekStart}T00:00:00.000Z`);
  const endDate = new Date(`${weekEnd}T00:00:00.000Z`);
  endDate.setUTCHours(23, 59, 59, 999);
  const now = getLagosNow();

  const serviceDates = REGULAR_SERVICE_DAYS.map((serviceDay) => {
    const date = new Date(startDate);
    const daysFromStart = (serviceDay.day - startDate.getUTCDay() + 7) % 7;

    date.setUTCDate(startDate.getUTCDate() + daysFromStart);
    date.setUTCHours(serviceDay.startHour, serviceDay.startMinute, 0, 0);

    return date;
  })
    .filter((date) => date >= startDate && date <= endDate)
    .sort((a, b) => a.getTime() - b.getTime());

  const mostRecentServiceDate = serviceDates
    .filter((date) => date <= now)
    .at(-1);

  if (mostRecentServiceDate) {
    return toDateInput(mostRecentServiceDate);
  }

  const wednesday = serviceDates.find((date) => date.getUTCDay() === 3);

  return wednesday ? toDateInput(wednesday) : weekStart;
}

function ReportNotice({
  tone = "urgent",
  message,
}: {
  tone?: "urgent" | "ok";
  message: string;
}) {
  return (
    <div
      className={
        tone === "ok"
          ? "rounded-card bg-ok-bg px-4 py-3 font-sans text-sm font-semibold leading-6 text-ok"
          : "rounded-card bg-urgent-bg px-4 py-3 font-sans text-sm font-semibold leading-6 text-urgent"
      }
    >
      {message}
    </div>
  );
}

function EmptyModule({ children }: { children: string }) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <p className="font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
        {children}
      </p>
    </section>
  );
}

function AttendanceSummary({
  total,
  present,
  absent,
  visitors,
}: {
  total: number;
  present: number;
  absent: number;
  visitors: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-card bg-surface p-[18px] shadow-lift sm:grid-cols-4">
      <Counter value={present} label="Present" />
      <Counter value={absent} label="Absent" />
      <Counter value={visitors} label="Visitors" />
      <Counter value={total} label="Members" />
    </div>
  );
}

function AbsenteeRecordsList({
  absenteeRecords,
  canRemove,
  reportId,
  companyId,
}: {
  absenteeRecords: AbsenteeRecordSummary[];
  canRemove: boolean;
  reportId: string;
  companyId: string;
}) {
  if (absenteeRecords.length === 0) {
    return (
      <div className="rounded-card bg-surface p-[18px] text-center shadow-lift">
        <p className="font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
          No absent members marked yet. Everyone remains present by default.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card bg-surface p-[18px] shadow-lift">
      {absenteeRecords.map((absenteeRecord) => (
        <div
          key={absenteeRecord.id}
          className="grid gap-3 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start [&+&]:shadow-[inset_0_1px_0_var(--rule)]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-sans text-[14.5px] font-semibold leading-tight tracking-[-0.005em] text-ink">
                {absenteeRecord.companyMemberName}
              </p>
              <Pill tone="urgent">Absent</Pill>
            </div>
            <p className="mt-1 font-sans text-xs leading-[1.4] text-ink-3">
              {formatAbsenceDate(absenteeRecord.absenceDate)} ·{" "}
              {ABSENCE_REASON_LABELS[
                absenteeRecord.reason as keyof typeof ABSENCE_REASON_LABELS
              ] ?? "No reason given"}
            </p>
            {absenteeRecord.reasonNote ? (
              <p className="mt-2 whitespace-pre-wrap break-words font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
                {absenteeRecord.reasonNote}
              </p>
            ) : null}
          </div>

          {canRemove ? (
            <form action={removeAbsenteeRecord}>
              <input type="hidden" name="reportId" value={reportId} />
              <input type="hidden" name="companyId" value={companyId} />
              <input
                type="hidden"
                name="absenteeRecordId"
                value={absenteeRecord.id}
              />
              <Button type="submit" variant="soft" className="w-full sm:w-fit">
                Remove
              </Button>
            </form>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AbsenteesSection({
  reportId,
  companyId,
  weekStart,
  weekEnd,
  activeCompanyMembers,
  absenteeRecords,
  canEdit,
}: {
  reportId: string;
  companyId: string;
  weekStart: string;
  weekEnd: string;
  activeCompanyMembers: CompanyMemberOption[];
  absenteeRecords: AbsenteeRecordSummary[];
  canEdit: boolean;
}) {
  const absenteeMemberIds = new Set(
    absenteeRecords.map((absenteeRecord) => absenteeRecord.companyMemberId),
  );
  const selectableMembers = activeCompanyMembers.filter(
    (member) => !absenteeMemberIds.has(member.id),
  );
  const absentMembers = activeCompanyMembers.filter((member) =>
    absenteeMemberIds.has(member.id),
  );
  const defaultAbsenceDate = getDefaultAbsenceDate(weekStart, weekEnd);

  return (
    <div className="grid gap-3">
      <section className="rounded-card bg-surface p-[18px] shadow-lift">
        <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
          Everyone present by default
        </p>
        <p className="mt-2 font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
          Mark only the members who were absent. Present totals are calculated
          from the active company list.
        </p>

        {activeCompanyMembers.length > 0 ? (
          <div className="mt-4 grid gap-3">
            {absentMembers.length > 0 ? (
              <div>
                <p className="mb-2 font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-urgent">
                  Marked absent
                </p>
                <div className="flex flex-wrap gap-2">
                  {absentMembers.map((member) => (
                    <MemberChip
                      key={member.id}
                      name={member.fullName}
                      state="absent"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <p className="mb-2 font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
                Present members
              </p>
              <div className="flex flex-wrap gap-2">
                {selectableMembers.length > 0 ? (
                  selectableMembers.map((member) => (
                    <MemberChip key={member.id} name={member.fullName} />
                  ))
                ) : (
                  <p className="font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
                    Every active member is marked absent.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
            This company has no active members yet.
          </p>
        )}
      </section>

      {canEdit ? (
        <form
          action={addAbsenteeRecord}
          className="grid gap-3 rounded-card bg-surface-2 p-[18px] shadow-lift"
        >
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="companyId" value={companyId} />

          <div>
            <h3 className="font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink">
              Mark an absent member.
            </h3>
            <p className="mt-1.5 font-sans text-[13px] leading-[1.55] text-ink-2">
              Choose the member, service date, and reason. This updates the
              absentee list only.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="companyMemberId" label="Company member">
              <Select
                id="companyMemberId"
                name="companyMemberId"
                required
                disabled={selectableMembers.length === 0}
                defaultValue=""
              >
                <option value="" disabled>
                  Select a member
                </option>
                {selectableMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.fullName}
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              htmlFor="absenceDate"
              label="Service date"
              hint="Sunday, Wednesday, or Friday within this report week."
            >
              <TextInput
                id="absenceDate"
                name="absenceDate"
                type="date"
                min={weekStart}
                max={weekEnd}
                defaultValue={defaultAbsenceDate}
                required
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="reason" label="Reason">
              <Select id="reason" name="reason" defaultValue="no_reason_given">
                {ABSENCE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {ABSENCE_REASON_LABELS[reason]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field htmlFor="reasonNote" label="Notes">
              <TextInput
                id="reasonNote"
                name="reasonNote"
                maxLength={1000}
                placeholder="Optional"
              />
            </Field>
          </div>

          <Button
            type="submit"
            variant="ink"
            className="w-full sm:w-fit"
            disabled={selectableMembers.length === 0}
          >
            Mark absent
          </Button>
        </form>
      ) : null}

      <AbsenteeRecordsList
        absenteeRecords={absenteeRecords}
        canRemove={canEdit}
        reportId={reportId}
        companyId={companyId}
      />
    </div>
  );
}

function DraftReportFlow({
  companyId,
  report,
  week,
  activeCompanyMembers,
  absenteeRecords,
  absenteeCount,
}: {
  companyId: string;
  report: WeeklyReportSummary;
  week: ReportWeekRange;
  activeCompanyMembers: CompanyMemberOption[];
  absenteeRecords: AbsenteeRecordSummary[];
  absenteeCount: number;
}) {
  const totalMembers = activeCompanyMembers.length || report.totalMembers || 0;
  const absentCount = absenteeCount;
  const presentCount = Math.max(0, totalMembers - absentCount);

  return (
    <>
      <StepRail steps={["Attendance", "Notes", "Submit"]} activeIndex={0} />

      <V2Sect action={`${totalMembers} members`}>Step 1 · Attendance</V2Sect>
      <AttendanceSummary
        total={totalMembers}
        present={presentCount}
        absent={absentCount}
        visitors={report.newVisitorsCount}
      />
      <AbsenteesSection
        reportId={report.id}
        companyId={companyId}
        weekStart={week.reportWeekStart}
        weekEnd={week.reportWeekEnd}
        activeCompanyMembers={activeCompanyMembers}
        absenteeRecords={absenteeRecords}
        canEdit
      />

      <form action={updateDraftWeeklyReport} className="grid gap-3">
        <input type="hidden" name="reportId" value={report.id} />
        <input type="hidden" name="companyId" value={companyId} />

        <V2Sect>Step 2 · Notes</V2Sect>
        <section className="grid gap-4 rounded-card bg-surface p-[18px] shadow-lift">
          <Field
            htmlFor="newVisitorsCount"
            label="New visitors"
            hint="Use zero when there were no new visitors."
          >
            <TextInput
              id="newVisitorsCount"
              name="newVisitorsCount"
              type="number"
              inputMode="numeric"
              min="0"
              defaultValue={report.newVisitorsCount}
              required
            />
          </Field>

          <Field htmlFor="generalNotes" label="General notes">
            <TextArea
              id="generalNotes"
              name="generalNotes"
              maxLength={1500}
              defaultValue={report.generalNotes ?? ""}
              placeholder="What should leadership know from this week?"
            />
          </Field>

          <Field htmlFor="supportNeeded" label="Support needed">
            <TextArea
              id="supportNeeded"
              name="supportNeeded"
              maxLength={1500}
              defaultValue={report.supportNeeded ?? ""}
              placeholder="Any care, pastoral, or operational support needed?"
            />
          </Field>

          <Field htmlFor="testimonies" label="Testimonies">
            <TextArea
              id="testimonies"
              name="testimonies"
              maxLength={1500}
              defaultValue={report.testimonies ?? ""}
              placeholder="A brief testimony or encouragement from the week."
            />
          </Field>
        </section>

        <V2Sect>Step 3 · Submit</V2Sect>
        <section className="grid gap-3 rounded-card bg-warm-soft p-[18px]">
          <div>
            <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em] text-warm">
              Final check
            </p>
            <h3 className="mt-2 font-serif text-[21px] font-medium leading-[1.2] tracking-[-0.012em] text-ink">
              Save progress or submit for review.
            </h3>
            <p className="mt-2 font-sans text-[13px] leading-[1.55] text-ink-2">
              Confirm the absentee list and notes before submitting. Submitted
              reports become read-only.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button type="submit" variant="soft" className="w-full sm:w-fit">
              Save progress
            </Button>
            <Button
              type="submit"
              formAction={submitWeeklyReport}
              variant="ink"
              className="w-full sm:w-fit"
            >
              Submit report
            </Button>
          </div>
        </section>
      </form>
    </>
  );
}

function NotesPanel({ report }: { report: WeeklyReportSummary }) {
  const notes = [
    ["General notes", report.generalNotes],
    ["Support needed", report.supportNeeded],
    ["Testimonies", report.testimonies],
  ] as const;

  return (
    <section className="grid gap-2 rounded-card bg-surface p-[18px] shadow-lift">
      {notes.map(([label, value]) => (
        <div
          key={label}
          className="py-3 first:pt-0 last:pb-0 [&+&]:shadow-[inset_0_1px_0_var(--rule)]"
        >
          <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
            {label}
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words font-sans text-[13px] leading-[1.55] text-ink-2">
            {value || "No note added."}
          </p>
        </div>
      ))}
    </section>
  );
}

function ReadOnlyReport({
  companyId,
  report,
  week,
  activeCompanyMembers,
  absenteeRecords,
}: {
  companyId: string;
  report: WeeklyReportSummary;
  week: ReportWeekRange;
  activeCompanyMembers: CompanyMemberOption[];
  absenteeRecords: AbsenteeRecordSummary[];
}) {
  const submittedAt = formatSubmittedDate(report.submittedAt);
  const reviewedAt = formatSubmittedDate(report.reviewedAt);

  return (
    <>
      <div className="mt-[18px]">
        <ReportStatusBadge status={report.status} />
      </div>

      <V2Sect>Submission record</V2Sect>
      <section className="grid gap-3 rounded-card bg-surface-2 p-[18px] shadow-lift">
        <div className="grid gap-2 font-sans text-[13px] leading-[1.55] text-ink-2">
          <p>
            Report week{" "}
            <span className="font-semibold text-ink">{formatReportWeek(week)}</span>
          </p>
          <p>
            Submitted{" "}
            <span className="font-semibold text-ink">
              {submittedAt || "Submission time unavailable"}
            </span>
          </p>
          {report.submittedBy ? (
            <p>
              Submitted by{" "}
              <span className="font-semibold text-ink">{report.submittedBy}</span>
            </p>
          ) : null}
          {reviewedAt ? (
            <p>
              Reviewed{" "}
              <span className="font-semibold text-ink">
                {reviewedAt}
                {report.reviewedBy ? ` by ${report.reviewedBy}` : ""}
              </span>
            </p>
          ) : null}
        </div>
        <p className="font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
          This report is read-only. Attendance, absentees, and notes are kept as
          submitted for leadership review.
        </p>
      </section>

      <V2Sect>Attendance</V2Sect>
      <AttendanceSummary
        total={report.totalMembers}
        present={report.presentCount}
        absent={report.absentCount}
        visitors={report.newVisitorsCount}
      />
      <AbsenteesSection
        reportId={report.id}
        companyId={companyId}
        weekStart={week.reportWeekStart}
        weekEnd={week.reportWeekEnd}
        activeCompanyMembers={activeCompanyMembers}
        absenteeRecords={absenteeRecords}
        canEdit={false}
      />

      <V2Sect>Notes from the week</V2Sect>
      <NotesPanel report={report} />
    </>
  );
}

function ReportProgressModule({
  overviewRows,
}: {
  overviewRows: AdminReportCompanyRow[];
}) {
  const total = overviewRows.length;
  const received = overviewRows.filter((row) =>
    ["submitted", "reviewed", "flagged"].includes(row.reportStatus),
  ).length;
  const submitted = overviewRows.filter((row) => row.reportStatus === "submitted")
    .length;
  const reviewed = overviewRows.filter((row) => row.reportStatus === "reviewed")
    .length;
  const flagged = overviewRows.filter((row) => row.reportStatus === "flagged")
    .length;
  const drafts = overviewRows.filter((row) => row.reportStatus === "draft")
    .length;
  const missing = overviewRows.filter(
    (row) => row.reportStatus === "not_started",
  ).length;
  const progress = total > 0 ? Math.round((received / total) * 100) : 0;

  return (
    <section className="rounded-card bg-warm-soft p-[18px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-warm">
          Submission progress
        </p>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-warm">
          {progress}%
        </p>
      </div>
      <h2 className="mt-2 font-serif text-[21px] font-medium leading-[1.2] tracking-[-0.012em] text-ink">
        {received} of {total} company reports received.
      </h2>
      <p className="mt-2 font-sans text-[13px] leading-[1.55] text-ink-2">
        Start with submitted reports awaiting review, then check flagged,
        in-progress, and missing company submissions.
      </p>
      <div className="mt-4">
        <Progress value={progress} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Counter value={reviewed} label="Reviewed" />
        <Counter value={submitted} label="Submitted" />
        <Counter value={flagged} label="Flagged" />
        <Counter value={drafts} label="Draft" />
        <Counter value={missing} label="Missing" />
      </div>
    </section>
  );
}

function ReportRowsSection({
  rows,
  empty,
}: {
  rows: AdminReportCompanyRow[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <EmptyModule>{empty}</EmptyModule>;
  }

  return (
    <section className="grid gap-3">
      {rows.map((row) => (
        <AdminReportCompanyCard key={row.company.id} row={row} />
      ))}
    </section>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorParam = resolvedSearchParams?.error;
  const reviewedParam = resolvedSearchParams?.reviewed;
  const flaggedParam = resolvedSearchParams?.flagged;
  const submittedParam = resolvedSearchParams?.submitted;
  const updatedParam = resolvedSearchParams?.updated;
  const errorValue = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const actionError = errorValue === "unable-to-start-draft";
  const updateError = errorValue === "unable-to-update-draft";
  const submitError = errorValue === "unable-to-submit-report";
  const absenteesError = errorValue === "unable-to-update-absentees";
  const missingAbsentMemberError = errorValue === "missing-absent-member";
  const invalidAbsenceDateError = errorValue === "invalid-absence-date";
  const inactiveDraftError = errorValue === "report-no-longer-editable";
  const duplicateAbsenteeError = errorValue === "duplicate-absentee";
  const reviewError = errorValue === "unable-to-review-report";
  const reportReviewed =
    (Array.isArray(reviewedParam) ? reviewedParam[0] : reviewedParam) ===
    "report";
  const reportFlagged =
    (Array.isArray(flaggedParam) ? flaggedParam[0] : flaggedParam) ===
    "report";
  const reportSubmitted =
    (Array.isArray(submittedParam) ? submittedParam[0] : submittedParam) ===
    "report";
  const draftUpdated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) === "draft";
  const absenteesUpdated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) ===
    "absentees";
  const { user, profile, primaryRole, churchId, church } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";

  let greeting = (
    <V2Greeting
      eyebrow={`Weekly Report · ${formatReportWeek(getCurrentReportWeek())}`}
      title={
        <>
          Weekly <em>reports.</em>
        </>
      }
      subtitle="Weekly report access will appear when assigned."
    />
  );
  let content = (
    <>
      <ReportWeekCard week={getCurrentReportWeek()} />
      <ReportEmptyState title="Report access is limited">
        <p>
          Weekly report access will appear here when your leadership role is
          assigned to a reporting workflow.
        </p>
      </ReportEmptyState>
    </>
  );

  if (!churchId) {
    content = (
      <>
        <ReportWeekCard week={getCurrentReportWeek()} />
        <ReportEmptyState title="No active church membership found">
          <p>
            Report visibility depends on an active church membership. Ask an
            admin to confirm your access.
          </p>
        </ReportEmptyState>
      </>
    );
  } else if (isAdmin) {
    const overviewResult = await getAdminReportsOverview(churchId);
    const overview = overviewResult.data;
    const needsAttentionRows = overview.rows.filter((row) =>
      ["submitted", "flagged"].includes(row.reportStatus),
    );
    const missingRows = overview.rows.filter(
      (row) => row.reportStatus === "not_started",
    );
    const draftRows = overview.rows.filter(
      (row) => row.reportStatus === "draft",
    );
    const awaitingReviewRows = overview.rows.filter(
      (row) => row.reportStatus === "submitted",
    );
    const reviewedRows = overview.rows.filter((row) =>
      ["reviewed", "flagged"].includes(row.reportStatus),
    );

    greeting = (
      <V2Greeting
        eyebrow={`Weekly Report · ${formatReportWeek(overview.week)}`}
        title={
          <>
            Reports <em>overview.</em>
          </>
        }
        subtitle="Submission progress across leadership, with review work kept close at hand."
      />
    );
    content = (
      <>
        {overviewResult.error ? (
          <ReportNotice message={overviewResult.error} />
        ) : null}
        {reviewError ? (
          <ReportNotice message="Report could not be reviewed." />
        ) : null}
        {reportReviewed ? (
          <ReportNotice tone="ok" message="Report review saved." />
        ) : null}
        {reportFlagged ? (
          <ReportNotice tone="ok" message="Report flagged for follow-up." />
        ) : null}

        <ReportProgressModule overviewRows={overview.rows} />

        <V2Sect>Needs your attention</V2Sect>
        <ReportRowsSection
          rows={needsAttentionRows}
          empty="No submitted or flagged reports need attention right now."
        />

        <V2Sect>Missing submissions</V2Sect>
        <ReportRowsSection
          rows={missingRows}
          empty="No missing company submissions for this week."
        />

        <V2Sect>In progress</V2Sect>
        <ReportRowsSection
          rows={draftRows}
          empty="No draft reports are in progress."
        />

        <V2Sect>Awaiting review</V2Sect>
        <ReportRowsSection
          rows={awaitingReviewRows}
          empty="No submitted reports are awaiting review."
        />

        <V2Sect>Reviewed this week</V2Sect>
        <ReportRowsSection
          rows={reviewedRows}
          empty="Reviewed and flagged reports will gather here."
        />
      </>
    );
  } else if (isCompanyLeader) {
    const workspaceResult = await getCompanyReportWorkspace(user.id, churchId);
    const workspace = workspaceResult.data;
    const statusCopy = getCompanyStatusCopy(workspace.reportStatus);
    const canStartDisplayedReport =
      workspace.company?.status === "active" &&
      workspace.reportStatus === "not_started";
    const draftReport =
      workspace.company?.status === "active" &&
      workspace.reportStatus === "draft" &&
      workspace.report
        ? workspace.report
        : null;
    const readOnlyReport =
      workspace.company?.status === "active" &&
      workspace.report &&
      ["submitted", "reviewed", "flagged"].includes(workspace.reportStatus)
        ? workspace.report
        : null;
    const isDisplayedCompanyInactive =
      workspace.company?.status === "inactive";
    const companyName = workspace.company?.name ?? "Company report";
    const reportCardBody = isDisplayedCompanyInactive
      ? "This company is inactive, so a weekly report draft cannot be started for it. Ask an admin to confirm your current company assignment."
      : workspace.reportStatus === "not_started"
        ? "Start a draft for this week, then mark absent members and add report notes before submission."
        : workspace.reportStatus === "draft"
          ? "Three quiet steps. Tap absent members, add notes, submit."
          : workspace.reportStatus === "submitted"
            ? "This report has been submitted for review. Editing is disabled."
            : "This report is read-only for this week.";

    greeting = (
      <V2Greeting
        eyebrow={`Weekly Report · ${formatReportWeek(workspace.week)}`}
        title={
          <>
            {companyName}{" "}
            <em>{REPORT_STATUS_LABELS[workspace.reportStatus].toLowerCase()}.</em>
          </>
        }
        subtitle={
          draftReport
            ? "Three quiet steps. Tap absent members, add notes, submit."
            : reportCardBody
        }
      />
    );

    content = (
      <>
        {actionError ? (
          <ReportNotice message="We could not start this week's draft report. Please try again or ask an admin to confirm your company assignment." />
        ) : null}
        {updateError ? (
          <ReportNotice message="We could not save this draft report. Try again or ask an admin to confirm your company assignment." />
        ) : null}
        {submitError ? (
          <ReportNotice message="We could not submit this report. Confirm the absent list is correct and try again." />
        ) : null}
        {absenteesError ? (
          <ReportNotice message="We could not update the absentee list. Try again." />
        ) : null}
        {missingAbsentMemberError ? (
          <ReportNotice message="Select the absent member before marking them absent." />
        ) : null}
        {invalidAbsenceDateError ? (
          <ReportNotice message="Choose a valid service date for this report week." />
        ) : null}
        {inactiveDraftError ? (
          <ReportNotice message="This report is no longer editable." />
        ) : null}
        {duplicateAbsenteeError ? (
          <ReportNotice message="This member is already marked absent for this report." />
        ) : null}
        {draftUpdated ? (
          <ReportNotice tone="ok" message="Draft report saved." />
        ) : null}
        {absenteesUpdated ? (
          <ReportNotice tone="ok" message="Absentee list updated." />
        ) : null}
        {reportSubmitted ? (
          <ReportNotice
            tone="ok"
            message="Report submitted. Editing is now locked while it waits for review."
          />
        ) : null}
        {workspaceResult.error ? (
          <ReportNotice message={workspaceResult.error} />
        ) : null}

        {workspace.company ? (
          <>
            <section className="mt-[18px] rounded-card bg-surface p-[18px] shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
                    Assigned company
                  </p>
                  <h2 className="mt-2 truncate font-serif text-[21px] font-medium leading-[1.2] tracking-[-0.012em] text-ink">
                    {workspace.company.name}
                  </h2>
                </div>
                <ReportStatusBadge status={workspace.reportStatus} />
              </div>
              {!draftReport && !readOnlyReport ? (
                <p className="mt-3 font-sans text-[13px] leading-[1.55] text-ink-2">
                  {reportCardBody}
                </p>
              ) : null}

              {canStartDisplayedReport ? (
                <form action={startWeeklyReportDraft} className="mt-4">
                  <input
                    type="hidden"
                    name="companyId"
                    value={workspace.company.id}
                  />
                  <Button type="submit" variant="ink" className="w-full sm:w-fit">
                    Start report
                  </Button>
                </form>
              ) : null}
            </section>

            {draftReport ? (
              <DraftReportFlow
                companyId={workspace.company.id}
                report={draftReport}
                week={workspace.week}
                activeCompanyMembers={workspace.activeCompanyMembers}
                absenteeRecords={workspace.absenteeRecords}
                absenteeCount={workspace.absenteeCount}
              />
            ) : readOnlyReport ? (
              <ReadOnlyReport
                companyId={workspace.company.id}
                report={readOnlyReport}
                week={workspace.week}
                activeCompanyMembers={workspace.activeCompanyMembers}
                absenteeRecords={workspace.absenteeRecords}
              />
            ) : workspace.reportStatus === "not_started" ? null : (
              <Button
                type="button"
                disabled
                variant="soft"
                className="mt-3 w-full sm:w-fit"
              >
                {statusCopy.cta}
              </Button>
            )}
          </>
        ) : (
          <ReportEmptyState title="No assigned company found">
            <p>
              Your report workspace will appear when an admin assigns you as a
              company leader or assistant leader.
            </p>
          </ReportEmptyState>
        )}
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      {greeting}
      <div className="mt-[18px] grid gap-3">{content}</div>
    </AppShell>
  );
}
