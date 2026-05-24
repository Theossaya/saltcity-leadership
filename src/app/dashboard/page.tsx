import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Notice } from "@/components/v2/modules/notice";
import { ReminderCard } from "@/components/v2/modules/reminder-card";
import { Word } from "@/components/v2/modules/word";
import { Counter } from "@/components/v2/primitives/counter";
import { Pill } from "@/components/v2/primitives/pill";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { DEFAULT_REPORT_DEADLINE_LABEL } from "@/lib/constants/app";
import { formatRole } from "@/lib/utils/format-role";

const APP_TIME_ZONE = "Africa/Lagos";

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

function EmptyModule({ children }: { children: string }) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <p className="font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
        {children}
      </p>
    </section>
  );
}

export default async function DashboardPage() {
  const { user, profile, primaryRole, church, assignedCompany } =
    await getCurrentUser();

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

  const greetingTitle = isAdmin ? (
    <>
      {getGreetingWord(now)}, <em>{firstName}.</em>
    </>
  ) : (
    <>
      {getGreetingWord(now)}, <em>{firstName}.</em>
    </>
  );

  const greetingSubtitle = isAdmin
    ? "A quiet operations briefing for reports, care, and leadership follow-through."
    : isCompanyLeader
      ? "A few faithful checks for your company before the week closes."
      : "Leadership updates and assignments will gather here as they are shared.";

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <V2Greeting
        eyebrow={formatDashboardDate(now)}
        title={greetingTitle}
        subtitle={greetingSubtitle}
      />

      <Word
        body="Let all things be done decently and in order."
        cite="1 Corinthians 14:40"
      />

      {isAdmin ? (
        <>
          <V2Sect action="Review queue" href="/reports">
            Reports · This week
          </V2Sect>
          <ReminderCard
            eyebrow="Report watch"
            title="See which companies are ready for review."
            body="Open the reports workspace for submitted, missing, flagged, and reviewed company reports."
            progress={0}
            progressLabel="Live counts on reports"
            progressMeta="No extra dashboard query"
            primaryAction="Review reports"
            primaryHref="/reports"
            secondaryAction="Companies"
            secondaryHref="/companies"
          >
            <div className="grid grid-cols-3 gap-4 rounded-input bg-surface/55 p-3">
              <Counter value="—" label="Submitted" />
              <Counter value="—" label="Missing" />
              <Counter value="—" label="Flagged" />
            </div>
          </ReminderCard>

          <V2Sect action="Open reports" href="/reports">
            Missing submissions
          </V2Sect>
          <EmptyModule>
            Missing company submissions are listed on the reports page.
          </EmptyModule>

          <V2Sect action="See all care" href="/follow-up">
            Urgent care
          </V2Sect>
          <EmptyModule>
            Urgent care cases will appear here when the care queue is loaded.
          </EmptyModule>

          <V2Sect action="All tasks" href="/tasks">
            Admin checklist
          </V2Sect>
          <EmptyModule>
            Assigned admin tasks will appear here when the task overview is
            connected to this briefing.
          </EmptyModule>

          <V2Sect action="Notices" href="/announcements">
            From the desk
          </V2Sect>
          <Notice
            title="Official notices live on the notice board."
            body="Urgent or active announcements will be reviewed from the announcements workspace in this visual pass."
            date={formatDashboardDate(now)}
            tag="Leadership"
          />
        </>
      ) : isCompanyLeader ? (
        <>
          <V2Sect action="Open report" href="/reports">
            This week
          </V2Sect>
          <ReminderCard
            eyebrow="Company report"
            deadline={DEFAULT_REPORT_DEADLINE_LABEL}
            title={
              assignedCompany
                ? `${assignedCompany.name} report workspace`
                : "Your report workspace is waiting"
            }
            body={
              assignedCompany
                ? "Prepare attendance, absentees, and notes from the week in one guided flow."
                : "An admin needs to assign your company before your weekly report can be prepared."
            }
            progress={assignedCompany ? 20 : 0}
            progressLabel={assignedCompany ? "Ready to begin" : "No company yet"}
            progressMeta="Guided report"
            primaryAction={assignedCompany ? "Continue report" : "Open reports"}
            primaryHref="/reports"
            secondaryAction="My company"
            secondaryHref="/companies"
          >
            <div className="flex flex-wrap gap-2">
              <Pill tone={assignedCompany ? "care" : "quiet"}>
                {assignedCompany ? formatRole(primaryRole) : "Assignment needed"}
              </Pill>
              {assignedCompany ? (
                <Pill tone="quiet">{assignedCompany.name}</Pill>
              ) : null}
            </div>
          </ReminderCard>

          <V2Sect action="See all care" href="/follow-up">
            People to remember
          </V2Sect>
          <EmptyModule>
            Care previews will appear here when absentee or follow-up data is
            connected to this briefing.
          </EmptyModule>

          <V2Sect action="All tasks" href="/tasks">
            Small things to close
          </V2Sect>
          <EmptyModule>
            Assigned tasks will appear here when the task overview is connected
            to this briefing.
          </EmptyModule>

          <V2Sect action="Calendar" href="/events">
            Sunday is coming
          </V2Sect>
          <EmptyModule>
            Event previews will appear here when the events overview is
            connected to this briefing.
          </EmptyModule>

          <V2Sect action="Notices" href="/announcements">
            From the desk
          </V2Sect>
          <Notice
            title="No notice is pinned to this briefing yet."
            body="Active leadership announcements are available from the notice board."
            date={formatDashboardDate(now)}
            tone="quiet"
          />
        </>
      ) : (
        <>
          <V2Sect>Leadership briefing</V2Sect>
          <ReminderCard
            eyebrow="Your next step"
            title="Check the spaces shared with you."
            body="Announcements, tasks, and events will carry the leadership work currently visible to your role."
            progress={0}
            progressLabel="Role-based access"
            progressMeta={formatRole(primaryRole)}
            primaryAction="Open tasks"
            primaryHref="/tasks"
            secondaryAction="Announcements"
            secondaryHref="/announcements"
          />

          <V2Sect>From the desk</V2Sect>
          <Notice
            title="Leadership notices are ready when posted."
            body="The announcement board remains the source for active notices and urgent updates."
            tone="quiet"
          />
        </>
      )}
    </AppShell>
  );
}
