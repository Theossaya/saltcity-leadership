import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/get-current-user";
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

export default async function ReportsPage() {
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

    content = (
      <>
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
                  Report creation and submission controls will be added in the
                  next reporting pass.
                </p>
              </div>

              <Button
                type="button"
                disabled
                className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
              >
                {statusCopy.cta}
              </Button>
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
