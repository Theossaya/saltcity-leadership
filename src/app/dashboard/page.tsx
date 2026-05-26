import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { EventCard } from "@/components/v2/modules/event-card";
import { Notice } from "@/components/v2/modules/notice";
import { ReminderCard } from "@/components/v2/modules/reminder-card";
import { Word } from "@/components/v2/modules/word";
import { Button } from "@/components/v2/primitives/button";
import { Counter } from "@/components/v2/primitives/counter";
import { Pill } from "@/components/v2/primitives/pill";
import { PersonRow } from "@/components/v2/rows/person-row";
import { TaskRow } from "@/components/v2/rows/task-row";
import { getCurrentUser } from "@/features/auth/get-current-user";
import {
  getDashboardBriefing,
  type DashboardAnnouncementBrief,
  type DashboardCareBrief,
  type DashboardEventBrief,
  type DashboardReportBrief,
  type DashboardTaskBrief,
} from "@/features/dashboard/queries";
import type { FollowUpQueueItem } from "@/features/follow-up/queries";
import type { ReportStatus } from "@/features/reports/queries";
import { DEFAULT_REPORT_DEADLINE_LABEL } from "@/lib/constants/app";
import {
  FOLLOW_UP_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/lib/constants/statuses";
import { formatRole } from "@/lib/utils/format-role";

const APP_TIME_ZONE = "Africa/Lagos";

const reportStatusTone: Record<ReportStatus, "urgent" | "care" | "ok" | "quiet"> =
  {
    not_started: "quiet",
    draft: "quiet",
    submitted: "care",
    reviewed: "ok",
    flagged: "urgent",
  };

function getFirstName(displayName: string) {
  return displayName.trim().split(/\s+/)[0] || "Leader";
}

function formatDashboardDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(`${start}T00:00:00Z`))} - ${formatter.format(
    new Date(`${end}T00:00:00Z`),
  )}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    timeZone: APP_TIME_ZONE,
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatEventParts(value: string) {
  const date = new Date(value);

  return {
    month: new Intl.DateTimeFormat("en", {
      month: "short",
      timeZone: APP_TIME_ZONE,
    }).format(date),
    day: new Intl.DateTimeFormat("en", {
      weekday: "short",
      timeZone: APP_TIME_ZONE,
    }).format(date),
    date: new Intl.DateTimeFormat("en", {
      day: "2-digit",
      timeZone: APP_TIME_ZONE,
    }).format(date),
  };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(value));
}

function getGreetingWord(date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: APP_TIME_ZONE,
      hour: "numeric",
      hour12: false,
    }).format(date),
  );

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

function getCareTone(item: FollowUpQueueItem): "urgent" | "care" | "ok" | "quiet" {
  if (item.followUpStatus === "escalated" || item.priority === "urgent") {
    return "urgent";
  }

  if (item.followUpStatus === "contacted") {
    return "ok";
  }

  return "care";
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

function DashboardNotice({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 rounded-card bg-quiet-bg px-4 py-3 font-sans text-xs leading-5 text-quiet">
      Some briefing details could not be refreshed. The available items are
      shown below.
    </section>
  );
}

function PreviewActions({
  primary,
  primaryHref,
  secondary,
  secondaryHref,
}: {
  primary: string;
  primaryHref: string;
  secondary?: string;
  secondaryHref?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2.5">
      <Button href={primaryHref} variant="ink">
        {primary}
      </Button>
      {secondary && secondaryHref ? (
        <Button href={secondaryHref} variant="soft">
          {secondary}
        </Button>
      ) : null}
    </div>
  );
}

function CarePreview({ care }: { care: DashboardCareBrief }) {
  if (care.items.length === 0) {
    return <EmptyModule>No follow-up assigned right now.</EmptyModule>;
  }

  return (
    <section className="rounded-card bg-surface p-[18px] shadow-lift">
      <div className="mb-2 grid grid-cols-2 gap-3 rounded-input bg-bg-tint p-3">
        <Counter value={care.activeCount} label="Active care" />
        <Counter value={care.urgentCount} label="Urgent" />
      </div>
      {care.items.map((item) => (
        <PersonRow
          key={item.followUpCaseId ?? item.absenteeRecordId}
          name={item.memberName}
          sub={`${item.companyName} · ${formatDate(item.absenceDate)}`}
          note={item.nextAction ?? item.reasonNote ?? "Care follow-up is active."}
          pill={
            item.followUpStatus === "not_started"
              ? "New"
              : FOLLOW_UP_STATUS_LABELS[item.followUpStatus]
          }
          tone={getCareTone(item)}
        />
      ))}
      <PreviewActions primary="See care" primaryHref="/follow-up" />
    </section>
  );
}

function TaskPreview({ tasks }: { tasks: DashboardTaskBrief }) {
  if (tasks.tasks.length === 0) {
    return <EmptyModule>Nothing pressing this week.</EmptyModule>;
  }

  const taskMessage =
    tasks.overdueCount === 1
      ? "One overdue task needs attention."
      : tasks.overdueCount > 1
        ? `${tasks.overdueCount} overdue tasks need attention.`
        : null;

  return (
    <section className="rounded-card bg-surface p-[18px] shadow-lift">
      {taskMessage ? (
        <p className="mb-2 rounded-input bg-urgent-bg px-3 py-2 font-sans text-sm font-semibold leading-6 text-urgent">
          {taskMessage}
        </p>
      ) : null}
      <div className="mb-2 grid grid-cols-3 gap-3 rounded-input bg-bg-tint p-3">
        <Counter value={tasks.overdueCount} label="Overdue" />
        <Counter value={tasks.dueTodayCount} label="Due today" />
        <Counter value={tasks.dueThisWeekCount} label="This week" />
      </div>
      {tasks.tasks.map(({ task, timing }) => (
        <TaskRow
          key={task.id}
          title={task.title}
          meta={`${timing === "overdue" ? "Overdue · " : ""}${
            task.dueDate ? formatDate(task.dueDate) : "No date"
          }${
            task.companyName ? ` · ${task.companyName}` : ""
          }`}
          priority={
            timing === "overdue"
              ? "Overdue"
              : task.priority
                ? TASK_PRIORITY_LABELS[task.priority]
                : undefined
          }
        />
      ))}
      <PreviewActions primary="View tasks" primaryHref="/tasks" />
    </section>
  );
}

function AnnouncementPreview({
  announcements,
}: {
  announcements: DashboardAnnouncementBrief;
}) {
  const announcement = announcements.announcement;

  if (!announcement) {
    return (
      <Notice
        title="No active notice today."
        body="Official notices will appear here when the church office publishes one."
        tone="quiet"
      />
    );
  }

  return (
    <div>
      <Notice
        title={announcement.title}
        body={announcement.message}
        date={formatDate(announcement.createdAt)}
        tag={announcement.audienceLabel}
        tone={announcement.isUrgent ? "urgent" : "accent"}
      />
      <PreviewActions primary="Read notice" primaryHref="/announcements" />
    </div>
  );
}

function EventPreview({ events }: { events: DashboardEventBrief }) {
  const event = events.happeningNow ?? events.upcoming;

  if (!event) {
    return <EmptyModule>No upcoming event yet.</EmptyModule>;
  }

  const dateParts = formatEventParts(event.startsAt);
  const time = event.endsAt
    ? `${formatTime(event.startsAt)} - ${formatTime(event.endsAt)}`
    : formatTime(event.startsAt);

  return (
    <div>
      <EventCard
        month={dateParts.month}
        day={dateParts.day}
        date={dateParts.date}
        title={event.title}
        eyebrow={events.happeningNow ? "Happening now" : "Next gathering"}
        meta={`${time} · ${event.location ?? "Location to be confirmed"}`}
      />
      <PreviewActions primary="Open calendar" primaryHref="/events" />
    </div>
  );
}

function CompanyReportPreview({ report }: { report: DashboardReportBrief }) {
  if (report.kind !== "company") {
    return null;
  }

  const { workspace } = report;
  const currentReport = workspace.report;
  const status = workspace.reportStatus;
  const title = workspace.company
    ? `${workspace.company.name} report is ${REPORT_STATUS_LABELS[status].toLowerCase()}`
    : "Your company assignment is needed";
  const body = currentReport
    ? `${formatDateRange(
        currentReport.reportWeekStart,
        currentReport.reportWeekEnd,
      )}: ${currentReport.presentCount} present, ${
        currentReport.absentCount
      } absent, ${currentReport.newVisitorsCount} visitors.`
    : workspace.company
      ? `${formatDateRange(
          workspace.week.reportWeekStart,
          workspace.week.reportWeekEnd,
        )}: no report has been started yet.`
      : "An admin needs to assign your company before this briefing can show report progress.";

  return (
    <ReminderCard
      eyebrow="Company report"
      deadline={DEFAULT_REPORT_DEADLINE_LABEL}
      title={title}
      body={body}
      progress={report.progress}
      progressLabel={REPORT_STATUS_LABELS[status]}
      progressMeta={formatDateRange(
        workspace.week.reportWeekStart,
        workspace.week.reportWeekEnd,
      )}
      primaryAction="Open report"
      primaryHref="/reports"
      secondaryAction={workspace.company ? "My company" : undefined}
      secondaryHref={workspace.company ? "/companies" : undefined}
    >
      <div className="flex flex-wrap gap-2">
        <Pill tone={reportStatusTone[status]}>{REPORT_STATUS_LABELS[status]}</Pill>
        {workspace.company ? <Pill tone="quiet">{workspace.company.name}</Pill> : null}
        {currentReport?.submittedAt ? <Pill tone="care">Submitted</Pill> : null}
        {currentReport?.reviewedAt ? <Pill tone="ok">Reviewed</Pill> : null}
      </div>
    </ReminderCard>
  );
}

function AdminReportPreview({ report }: { report: DashboardReportBrief }) {
  if (report.kind !== "admin") {
    return null;
  }

  const { overview } = report;

  return (
    <ReminderCard
      eyebrow="Report watch"
      title={`${overview.summary.submittedReports} of ${overview.summary.totalCompanies} company reports received`}
      body={`${formatDateRange(
        overview.week.reportWeekStart,
        overview.week.reportWeekEnd,
      )}: submitted, reviewed, and flagged reports count as received. Draft and missing reports still need attention.`}
      progress={report.progress}
      progressLabel={`${report.progress}% received`}
      progressMeta={`${overview.summary.missingReports} missing`}
      primaryAction="Review reports"
      primaryHref="/reports"
      secondaryAction="Companies"
      secondaryHref="/companies"
    >
      <div className="grid grid-cols-3 gap-4 rounded-input bg-surface/55 p-3 sm:grid-cols-5">
        <Counter value={overview.summary.submittedReports} label="Received" />
        <Counter value={report.reviewedReports} label="Reviewed" />
        <Counter value={overview.summary.flaggedReports} label="Flagged" />
        <Counter value={overview.summary.draftReports} label="Draft" />
        <Counter value={overview.summary.missingReports} label="Missing" />
      </div>
    </ReminderCard>
  );
}

function AdminAttention({ report, care }: { report: DashboardReportBrief; care: DashboardCareBrief }) {
  if (report.kind !== "admin") {
    return null;
  }

  const attentionRows = [
    ...report.flaggedRows.map((row) => ({
      key: `flagged-${row.company.id}`,
      title: row.company.name,
      description: row.reviewerNotes ?? "Flagged report needs attention.",
      pill: "Flagged",
      tone: "urgent" as const,
    })),
    ...report.missingRows.map((row) => ({
      key: `missing-${row.company.id}`,
      title: row.company.name,
      description: row.leaderName ? `${row.leaderName} has not submitted yet.` : "No report submitted yet.",
      pill: "Missing",
      tone: "quiet" as const,
    })),
    ...report.awaitingReview.map((row) => ({
      key: `review-${row.company.id}`,
      title: row.company.name,
      description: row.submittedByName ? `Submitted by ${row.submittedByName}.` : "Submitted and waiting for review.",
      pill: "Review",
      tone: "care" as const,
    })),
  ].slice(0, 3);

  if (attentionRows.length === 0 && care.urgentCount === 0) {
    return <EmptyModule>Nothing pressing this week.</EmptyModule>;
  }

  return (
    <section className="rounded-card bg-surface p-[18px] shadow-lift">
      {care.urgentCount > 0 ? (
        <div className="mb-2 rounded-input bg-urgent-bg px-3 py-2 font-sans text-sm font-semibold text-urgent">
          {care.urgentCount} urgent care {care.urgentCount === 1 ? "item" : "items"} need prayerful attention.
        </div>
      ) : null}
      {attentionRows.map((row) => (
        <PersonRow
          key={row.key}
          name={row.title}
          sub={row.description}
          pill={row.pill}
          tone={row.tone}
        />
      ))}
      <PreviewActions primary="Review reports" primaryHref="/reports" secondary="See care" secondaryHref="/follow-up" />
    </section>
  );
}

export default async function DashboardPage() {
  const { user, profile, primaryRole, church, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const firstName = getFirstName(displayName);
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";

  if (!churchId || !primaryRole) {
    return (
      <AppShell
        displayName={displayName}
        role={primaryRole}
        churchName={church?.name}
      >
        <V2Greeting
          eyebrow={formatDashboardDate(now)}
          title={
            <>
              Welcome, <em>{firstName}.</em>
            </>
          }
          subtitle="Your SaltCity Leadership account is signed in."
        />

        <Notice
          title="No active leadership profile is connected yet."
          body="Your account is signed in, but no active leadership profile is connected yet. Please contact the church office."
          tone="quiet"
          tag="Account"
        />

        <section className="mt-4 rounded-card bg-surface p-[18px] shadow-lift">
          <h2 className="font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
            Briefing access will appear here.
          </h2>
          <p className="mt-2 font-sans text-[13px] leading-5 text-ink-2 text-pretty">
            Once the office connects an active leadership profile to this email
            address, reports, care, tasks, notices, and events will be shown for
            your role.
          </p>
        </section>
      </AppShell>
    );
  }

  const briefing = await getDashboardBriefing({
    userId: user.id,
    churchId,
    role: primaryRole,
  });

  const greetingSubtitle = isAdmin
    ? "A quiet operations briefing for reports, care, and leadership follow-through."
    : isCompanyLeader
      ? "A few faithful checks for your company before the week closes."
      : "Leadership updates and assignments gathered for your role.";

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <V2Greeting
        eyebrow={formatDashboardDate(now)}
        title={
          <>
            {getGreetingWord(now)}, <em>{firstName}.</em>
          </>
        }
        subtitle={greetingSubtitle}
      />

      <Word
        body="Let all things be done decently and in order."
        cite="1 Corinthians 14:40"
      />

      <DashboardNotice messages={briefing.errors} />

      {isAdmin ? (
        <>
          <V2Sect action="Review reports" href="/reports">
            Reports · This week
          </V2Sect>
          <AdminReportPreview report={briefing.report} />

          <V2Sect action="Open queue" href="/reports">
            Needs attention
          </V2Sect>
          <AdminAttention report={briefing.report} care={briefing.care} />

          <V2Sect action="See care" href="/follow-up">
            Care watch
          </V2Sect>
          <CarePreview care={briefing.care} />

          <V2Sect action="View tasks" href="/tasks">
            Admin checklist
          </V2Sect>
          <TaskPreview tasks={briefing.tasks} />

          <V2Sect action="Read notice" href="/announcements">
            From the desk
          </V2Sect>
          <AnnouncementPreview announcements={briefing.announcements} />

          <V2Sect action="Open calendar" href="/events">
            Calendar
          </V2Sect>
          <EventPreview events={briefing.events} />
        </>
      ) : isCompanyLeader ? (
        <>
          <V2Sect action="Open report" href="/reports">
            This week
          </V2Sect>
          <CompanyReportPreview report={briefing.report} />

          <V2Sect action="See care" href="/follow-up">
            People to remember
          </V2Sect>
          <CarePreview care={briefing.care} />

          <V2Sect action="View tasks" href="/tasks">
            Small things to close
          </V2Sect>
          <TaskPreview tasks={briefing.tasks} />

          <V2Sect action="Read notice" href="/announcements">
            From the desk
          </V2Sect>
          <AnnouncementPreview announcements={briefing.announcements} />

          <V2Sect action="Open calendar" href="/events">
            Sunday is coming
          </V2Sect>
          <EventPreview events={briefing.events} />
        </>
      ) : (
        <>
          <V2Sect action={formatRole(primaryRole)}>Leadership briefing</V2Sect>
          <ReminderCard
            eyebrow="Your next step"
            title="Check the work shared with you."
            body="This briefing shows assigned care, due tasks, official notices, and leadership calendar items visible to your role."
            progress={
              briefing.tasks.overdueCount > 0 || briefing.tasks.actionableCount > 0
                ? 45
                : 0
            }
            progressLabel={
              briefing.tasks.overdueCount > 0
                ? `${briefing.tasks.overdueCount} overdue`
                : `${briefing.tasks.actionableCount} due this week`
            }
            progressMeta={formatRole(primaryRole)}
            primaryAction="Open tasks"
            primaryHref="/tasks"
            secondaryAction="Announcements"
            secondaryHref="/announcements"
          />

          <V2Sect action="See care" href="/follow-up">
            Assigned care
          </V2Sect>
          <CarePreview care={briefing.care} />

          <V2Sect action="View tasks" href="/tasks">
            Checklist
          </V2Sect>
          <TaskPreview tasks={briefing.tasks} />

          <V2Sect action="Read notice" href="/announcements">
            From the desk
          </V2Sect>
          <AnnouncementPreview announcements={briefing.announcements} />

          <V2Sect action="Open calendar" href="/events">
            Calendar
          </V2Sect>
          <EventPreview events={briefing.events} />
        </>
      )}
    </AppShell>
  );
}
