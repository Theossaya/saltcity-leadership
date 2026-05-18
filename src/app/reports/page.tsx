import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { Textarea } from "@/components/ui/textarea";
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
import { ReportWeekCard } from "@/features/reports/components/report-week-card";
import {
  getAdminReportsOverview,
  getCompanyReportWorkspace,
  getCurrentReportWeek,
  type AbsenteeRecordSummary,
  type CompanyMemberOption,
  type ReportStatus,
} from "@/features/reports/queries";
import { ABSENCE_REASON_LABELS, ABSENCE_REASONS } from "@/lib/constants/statuses";

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

type ReportsPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    reviewed?: string | string[];
    submitted?: string | string[];
    updated?: string | string[];
  }>;
};

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

const REGULAR_SERVICE_DAYS = [
  { day: 0, startHour: 9, startMinute: 0 },
  { day: 3, startHour: 17, startMinute: 0 },
  { day: 5, startHour: 17, startMinute: 0 },
];

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
    const daysFromStart =
      (serviceDay.day - startDate.getUTCDay() + 7) % 7;

    date.setUTCDate(startDate.getUTCDate() + daysFromStart);
    date.setUTCHours(serviceDay.startHour, serviceDay.startMinute, 0, 0);

    return date;
  })
    .filter((date) => date >= startDate && date <= endDate)
    .sort((a, b) => a.getTime() - b.getTime());

  // Special programmes should become configurable later.
  const mostRecentServiceDate = serviceDates
    .filter((date) => date <= now)
    .at(-1);

  if (mostRecentServiceDate) {
    return toDateInput(mostRecentServiceDate);
  }

  const wednesday = serviceDates.find((date) => date.getUTCDay() === 3);

  return wednesday ? toDateInput(wednesday) : weekStart;
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
      <div className="rounded-lg border border-dashed border-primary/20 bg-white px-4 py-3 text-sm text-muted-foreground shadow-xs">
        No absentee records added yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {absenteeRecords.map((absenteeRecord) => (
        <div
          key={absenteeRecord.id}
          className="grid gap-3 rounded-lg border border-border/80 bg-white p-3 shadow-xs sm:grid-cols-[1fr_auto] sm:items-start sm:p-4"
        >
          <div className="min-w-0">
            <p className="font-medium text-foreground">
              {absenteeRecord.companyMemberName}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatAbsenceDate(absenteeRecord.absenceDate)} ·{" "}
              {ABSENCE_REASON_LABELS[
                absenteeRecord.reason as keyof typeof ABSENCE_REASON_LABELS
              ] ?? "No reason given"}
            </p>
            {absenteeRecord.reasonNote ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
              <Button
                type="submit"
                variant="outline"
                className="h-11 w-full border-border/80 bg-white sm:w-fit"
              >
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
  const defaultAbsenceDate = getDefaultAbsenceDate(weekStart, weekEnd);

  return (
    <section className="grid gap-4 rounded-lg border border-primary/15 bg-[#FBFAF8] p-4 shadow-[0_10px_28px_rgba(21,18,23,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Mark absent members
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Everyone starts as present. Add only the members who were absent.
          </p>
        </div>
      </div>

      {activeCompanyMembers.length > 0 ? (
        <div className="rounded-lg border border-border/80 bg-white p-3 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
            Present by default
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectableMembers.length > 0 ? (
              selectableMembers.map((member) => (
                <span
                  key={member.id}
                  className="rounded-full border border-border/80 bg-[#FBFAF8] px-3 py-1 text-xs font-medium text-foreground"
                >
                  {member.fullName}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                Every active member is marked absent.
              </span>
            )}
          </div>
        </div>
      ) : null}

      {canEdit ? (
        <form action={addAbsenteeRecord} className="grid gap-4">
          <input type="hidden" name="reportId" value={reportId} />
          <input type="hidden" name="companyId" value={companyId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="companyMemberId">Company member</Label>
              <select
                id="companyMemberId"
                name="companyMemberId"
                className="h-12 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="absenceDate">Service date</Label>
              <Input
                id="absenceDate"
                name="absenceDate"
                type="date"
                min={weekStart}
                max={weekEnd}
                defaultValue={defaultAbsenceDate}
                className="h-12 bg-background"
                required
              />
              <p className="text-xs text-muted-foreground">
                Sunday 9:00-13:00, Wednesday 17:00-19:30, Friday 17:00-19:30.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <select
                id="reason"
                name="reason"
                className="h-12 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue="no_reason_given"
              >
                {ABSENCE_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {ABSENCE_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reasonNote">Notes</Label>
              <Input
                id="reasonNote"
                name="reasonNote"
                maxLength={1000}
                className="h-12 bg-background"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="border-t border-border/80 pt-1">
            <Button
              type="submit"
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
              disabled={selectableMembers.length === 0}
            >
              Mark absent
            </Button>
          </div>
        </form>
      ) : null}

      <AbsenteeRecordsList
        absenteeRecords={absenteeRecords}
        canRemove={canEdit}
        reportId={reportId}
        companyId={companyId}
      />
    </section>
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorParam = resolvedSearchParams?.error;
  const reviewedParam = resolvedSearchParams?.reviewed;
  const submittedParam = resolvedSearchParams?.submitted;
  const updatedParam = resolvedSearchParams?.updated;
  const actionError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-start-draft";
  const updateError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-update-draft";
  const submitError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-submit-report";
  const absenteesError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-update-absentees";
  const missingAbsentMemberError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "missing-absent-member";
  const invalidAbsenceDateError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "invalid-absence-date";
  const inactiveDraftError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "report-no-longer-editable";
  const duplicateAbsenteeError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "duplicate-absentee";
  const reviewError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-review-report";
  const reportReviewed =
    (Array.isArray(reviewedParam) ? reviewedParam[0] : reviewedParam) ===
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

  let title = "Reports";
  let subtitle = "Weekly report access will appear when assigned.";
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
    title = "Reports";
    subtitle = "Weekly report visibility across companies.";

    const overviewResult = await getAdminReportsOverview(churchId);
    const overview = overviewResult.data;

    content = (
      <>
        {overviewResult.error ? (
          <QueryNotice message={overviewResult.error} />
        ) : null}

        {reviewError ? (
          <QueryNotice message="Report could not be reviewed." />
        ) : null}

        {reportReviewed ? (
          <QueryNotice message="Report review saved." />
        ) : null}

        <ReportWeekCard week={overview.week} />

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-5">
          <MetricCard
            label="Total companies"
            value={overview.summary.totalCompanies}
          />
          <MetricCard label="Submitted" value={overview.summary.submittedReports} />
          <MetricCard label="Missing" value={overview.summary.missingReports} />
          <MetricCard label="Draft" value={overview.summary.draftReports} />
          <MetricCard label="Flagged" value={overview.summary.flaggedReports} />
        </section>

        {overview.rows.length > 0 ? (
          <section className="grid gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/45 p-3">
            {overview.rows.map((row) => (
              <AdminReportCompanyCard key={row.company.id} row={row} />
            ))}
          </section>
        ) : (
          <ReportEmptyState title="No companies found">
            <p>
              Company report visibility will appear after companies are added
              for this church.
            </p>
          </ReportEmptyState>
        )}
      </>
    );
  } else if (isCompanyLeader) {
    title = "Reports";
    subtitle = "Weekly reporting for your assigned company.";

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
    const readOnlySubmittedAt = formatSubmittedDate(
      readOnlyReport?.submittedAt ?? null,
    );
    const computedTotalMembers =
      workspace.activeCompanyMembers.length || draftReport?.totalMembers || 0;
    const computedAbsentCount = workspace.absenteeCount;
    const computedPresentCount = Math.max(
      0,
      computedTotalMembers - computedAbsentCount,
    );
    const isDisplayedCompanyInactive =
      workspace.company?.status === "inactive";
    const reportCardBody = isDisplayedCompanyInactive
      ? "This company is inactive, so a weekly report draft cannot be started for it. Ask an admin to confirm your current company assignment."
      : workspace.reportStatus === "not_started"
        ? "Start a draft for this week, then mark absent members and add report notes before submission."
        : workspace.reportStatus === "draft"
          ? "Mark only the members who were absent. The app will calculate present and absent totals for you."
          : workspace.reportStatus === "submitted"
            ? "This report has been submitted for review. Editing is disabled."
            : "This report is no longer editable in this pass. Review controls will be added later.";

    content = (
      <>
        {actionError ? (
          <QueryNotice message="We could not start this week's draft report. Please try again or ask an admin to confirm your company assignment." />
        ) : null}

        {updateError ? (
          <QueryNotice message="We could not save this draft report. Try again or ask an admin to confirm your company assignment." />
        ) : null}

        {submitError ? (
          <QueryNotice message="We could not submit this report. Confirm the absent list is correct and try again." />
        ) : null}

        {absenteesError ? (
          <QueryNotice message="We could not update the absentee list. Try again." />
        ) : null}

        {missingAbsentMemberError ? (
          <QueryNotice message="Select the absent member before marking them absent." />
        ) : null}

        {invalidAbsenceDateError ? (
          <QueryNotice message="Choose a valid service date for this report week." />
        ) : null}

        {inactiveDraftError ? (
          <QueryNotice message="This report is no longer editable." />
        ) : null}

        {duplicateAbsenteeError ? (
          <QueryNotice message="This member is already marked absent for this report." />
        ) : null}

        {draftUpdated ? (
          <QueryNotice message="Draft report saved." />
        ) : null}

        {absenteesUpdated ? (
          <QueryNotice message="Absentee list updated." />
        ) : null}

        {reportSubmitted ? (
          <QueryNotice message="Report submitted. Editing is now locked while it waits for review." />
        ) : null}

        {workspaceResult.error ? (
          <QueryNotice message={workspaceResult.error} />
        ) : null}

        <ReportWeekCard week={workspace.week} />

        {workspace.company ? (
          <Card className="rounded-lg border-primary/15 bg-card shadow-[0_14px_36px_rgba(21,18,23,0.06)]">
            <CardHeader className="gap-3 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                    Assigned company
                  </p>
                  <CardTitle className="mt-1 truncate text-xl font-semibold">
                    {workspace.company.name}
                  </CardTitle>
                </div>
                <ReportStatusBadge status={workspace.reportStatus} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {readOnlyReport ? null : (
                <div className="rounded-lg border border-primary/15 bg-[#FBFAF8] p-4">
                  <h2 className="text-base font-semibold text-foreground">
                    {statusCopy.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {reportCardBody}
                  </p>
                </div>
              )}

              {canStartDisplayedReport ? (
                <form action={startWeeklyReportDraft}>
                  <input
                    type="hidden"
                    name="companyId"
                    value={workspace.company.id}
                  />
                  <Button
                    type="submit"
                    className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
                  >
                    Start report
                  </Button>
                </form>
              ) : draftReport ? (
                <form action={updateDraftWeeklyReport} className="grid gap-5">
                  <input
                    type="hidden"
                    name="reportId"
                    value={draftReport.id}
                  />
                  <input
                    type="hidden"
                    name="companyId"
                    value={workspace.company.id}
                  />

                  <div className="rounded-lg border border-primary/15 bg-[#FBFAF8] px-4 py-3 shadow-xs">
                    <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                      Attendance summary
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {computedTotalMembers}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Present</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {computedPresentCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Absent</p>
                        <p className="text-2xl font-semibold text-foreground">
                          {computedAbsentCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-lg border border-border/80 bg-white p-4 shadow-xs">
                    <div className="grid gap-2">
                      <Label htmlFor="newVisitorsCount">New visitors</Label>
                      <Input
                        id="newVisitorsCount"
                        name="newVisitorsCount"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        defaultValue={draftReport.newVisitorsCount}
                        className="h-12 bg-background"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 rounded-lg border border-border/80 bg-white p-4 shadow-xs">
                    <div className="grid gap-2">
                      <Label htmlFor="generalNotes">General notes</Label>
                      <Textarea
                        id="generalNotes"
                        name="generalNotes"
                        maxLength={1500}
                        defaultValue={draftReport.generalNotes ?? ""}
                        className="min-h-28 bg-background"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="supportNeeded">Support needed</Label>
                      <Textarea
                        id="supportNeeded"
                        name="supportNeeded"
                        maxLength={1500}
                        defaultValue={draftReport.supportNeeded ?? ""}
                        className="min-h-28 bg-background"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="testimonies">Testimonies</Label>
                      <Textarea
                        id="testimonies"
                        name="testimonies"
                        maxLength={1500}
                        defaultValue={draftReport.testimonies ?? ""}
                        className="min-h-28 bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-lg border border-primary/15 bg-[#FBFAF8] p-4 shadow-sm">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        Submit report
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Make sure the absent list is correct, then submit for
                        review.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border/80 pt-1 sm:flex-row">
                      <Button
                        type="submit"
                        className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
                      >
                        Save draft
                      </Button>
                      <Button
                        type="submit"
                        formAction={submitWeeklyReport}
                        className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
                      >
                        Submit report
                      </Button>
                    </div>
                  </div>
                </form>
              ) : null}

              {draftReport ? (
                <AbsenteesSection
                  reportId={draftReport.id}
                  companyId={workspace.company.id}
                  weekStart={workspace.week.reportWeekStart}
                  weekEnd={workspace.week.reportWeekEnd}
                  activeCompanyMembers={workspace.activeCompanyMembers}
                  absenteeRecords={workspace.absenteeRecords}
                  canEdit
                />
              ) : readOnlyReport ? (
                <>
                  <div className="grid gap-4 rounded-lg border border-primary/15 bg-[#F1ECE6] p-4 shadow-[0_10px_28px_rgba(21,18,23,0.05)]">
                    <div>
                      <p className="text-xs font-semibold uppercase text-primary/75">
                        Read-only report
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {statusCopy.title}
                      </h3>
                    </div>
                    <div className="grid gap-2 rounded-lg border border-primary/10 bg-[#FBFAF8]/80 p-3 text-sm leading-6 text-muted-foreground">
                      <p>Editing is disabled for this report.</p>
                      {readOnlySubmittedAt ? (
                        <p>Submitted {readOnlySubmittedAt}</p>
                      ) : null}
                      {readOnlyReport.submittedBy ? (
                        <p>Submitted by {readOnlyReport.submittedBy}</p>
                      ) : null}
                    </div>
                  </div>

                  <AbsenteesSection
                    reportId={readOnlyReport.id}
                    companyId={workspace.company.id}
                    weekStart={workspace.week.reportWeekStart}
                    weekEnd={workspace.week.reportWeekEnd}
                    activeCompanyMembers={workspace.activeCompanyMembers}
                    absenteeRecords={workspace.absenteeRecords}
                    canEdit={false}
                  />
                </>
              ) : workspace.reportStatus === "not_started" ? (
                <Button
                  type="button"
                  disabled
                  className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
                >
                  Start report
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled
                  className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
                >
                  {statusCopy.cta}
                </Button>
              )}
            </CardContent>
          </Card>
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
      <PageHeader title={title} subtitle={subtitle} />

      {content}
    </AppShell>
  );
}
