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
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/features/auth/get-current-user";
import {
  startWeeklyReportDraft,
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
  type ReportStatus,
} from "@/features/reports/queries";

function QueryNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-[#FBFAF8] px-4 py-3 text-sm leading-6 text-muted-foreground">
      {message}
    </div>
  );
}

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

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm" size="sm">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

type ReportsPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    updated?: string | string[];
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = await searchParams;
  const errorParam = resolvedSearchParams?.error;
  const updatedParam = resolvedSearchParams?.updated;
  const actionError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-start-draft";
  const updateError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-update-draft";
  const draftUpdated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) === "draft";
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

        <ReportWeekCard week={overview.week} />

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryCard
            label="Total companies"
            value={overview.summary.totalCompanies}
          />
          <SummaryCard label="Submitted" value={overview.summary.submittedReports} />
          <SummaryCard label="Missing" value={overview.summary.missingReports} />
          <SummaryCard label="Draft" value={overview.summary.draftReports} />
          <SummaryCard label="Flagged" value={overview.summary.flaggedReports} />
        </section>

        {overview.rows.length > 0 ? (
          <section className="grid gap-3">
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
    const isDisplayedCompanyInactive =
      workspace.company?.status === "inactive";
    const reportCardBody = isDisplayedCompanyInactive
      ? "This company is inactive, so a weekly report draft cannot be started for it. Ask an admin to confirm your current company assignment."
      : workspace.reportStatus === "not_started"
        ? "Start a draft for this week. Report fields, absentee entry, and submission will be added in later reporting passes."
        : workspace.reportStatus === "draft"
          ? "Save this week's counts and basic notes. Submission, absentee entry, and follow-up creation are not active yet."
          : "This report is no longer editable in this pass. Submission review controls will be added later.";

    content = (
      <>
        {actionError ? (
          <QueryNotice message="We could not start this week's draft report. Please try again or ask an admin to confirm your company assignment." />
        ) : null}

        {updateError ? (
          <QueryNotice message="We could not save this draft report. Check the counts and try again, or ask an admin to confirm your company assignment." />
        ) : null}

        {draftUpdated ? (
          <QueryNotice message="Draft report saved." />
        ) : null}

        {workspaceResult.error ? (
          <QueryNotice message={workspaceResult.error} />
        ) : null}

        <ReportWeekCard week={workspace.week} />

        {workspace.company ? (
          <Card className="rounded-lg border-border/80 bg-card shadow-sm">
            <CardHeader className="gap-3">
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
              <div className="rounded-lg border border-border/80 bg-[#FBFAF8] p-4">
                <h2 className="text-base font-semibold text-foreground">
                  {statusCopy.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {reportCardBody}
                </p>
              </div>

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

                  <div className="rounded-lg border border-border/80 bg-[#FBFAF8] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                      Total members
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {draftReport.totalMembers}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <Label htmlFor="presentCount">Present count</Label>
                      <Input
                        id="presentCount"
                        name="presentCount"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        defaultValue={draftReport.presentCount}
                        className="h-12 bg-background"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="absentCount">Absent count</Label>
                      <Input
                        id="absentCount"
                        name="absentCount"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        defaultValue={draftReport.absentCount}
                        className="h-12 bg-background"
                        required
                      />
                    </div>
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

                  <div className="grid gap-4">
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

                  <Button
                    type="submit"
                    className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
                  >
                    Save draft
                  </Button>
                </form>
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
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </section>

      {content}
    </AppShell>
  );
}
