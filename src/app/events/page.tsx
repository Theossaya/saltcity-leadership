import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { EventCard } from "@/features/events/components/event-card";
import { EventEmptyState } from "@/features/events/components/event-empty-state";
import { EventSummaryCard } from "@/features/events/components/event-summary-card";
import { ServiceScheduleCard } from "@/features/events/components/service-schedule-card";
import {
  getAdminEvents,
  getLeaderEvents,
  type EventOverview,
} from "@/features/events/queries";

const regularServices = [
  { day: "Sunday", time: "9:00-13:00" },
  { day: "Wednesday", time: "17:00-19:30" },
  { day: "Friday", time: "17:00-19:30" },
];

function RestrictedState() {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Event access</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Event visibility is limited to active church leaders and church
          admins.
        </p>
      </CardContent>
    </Card>
  );
}

function RegularScheduleSection() {
  return (
    <section className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Regular services
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The standing weekly service rhythm for leadership planning.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {regularServices.map((service) => (
          <ServiceScheduleCard
            key={service.day}
            day={service.day}
            time={service.time}
          />
        ))}
      </div>
    </section>
  );
}

function EventList({ overview }: { overview: EventOverview }) {
  if (overview.events.length === 0) {
    return (
      <EventEmptyState
        title="No events configured yet."
        message="Regular services are shown above. Special programmes will be configured later."
      />
    );
  }

  return (
    <section className="grid gap-3">
      {overview.events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </section>
  );
}

function EventsOverview({ overview }: { overview: EventOverview }) {
  return (
    <>
      <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-4">
        <EventSummaryCard label="Upcoming" value={overview.summary.upcoming} />
        <EventSummaryCard label="This week" value={overview.summary.thisWeek} />
        <EventSummaryCard
          label="Regular services"
          value={overview.summary.regularServices}
        />
        {overview.summary.hasSpecialProgrammeSupport ? (
          <EventSummaryCard label="Special programmes" value="Ready" />
        ) : null}
      </section>

      <RegularScheduleSection />

      <EventList overview={overview} />
    </>
  );
}

export default async function EventsPage() {
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isLeader = Boolean(primaryRole);

  let subtitle = "Regular services and future event visibility.";
  let content = <RestrictedState />;

  if (!churchId) {
    content = (
      <Card className="rounded-lg border-border/80 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            No active church membership found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Event visibility depends on an active church membership. Ask an
            admin to confirm your access.
          </p>
        </CardContent>
      </Card>
    );
  } else if (isAdmin) {
    subtitle = "Church events and service visibility.";

    const eventsResult = await getAdminEvents(churchId);

    content = (
      <>
        {eventsResult.error ? (
          <QueryNotice message={eventsResult.error} />
        ) : null}
        <EventsOverview overview={eventsResult.data} />
      </>
    );
  } else if (isLeader) {
    subtitle = "Upcoming services and leadership events.";

    const eventsResult = await getLeaderEvents(user.id, churchId);

    content = (
      <>
        {eventsResult.error ? (
          <QueryNotice message={eventsResult.error} />
        ) : null}
        <EventsOverview overview={eventsResult.data} />
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <PageHeader title="Events" subtitle={subtitle} />

      {content}
    </AppShell>
  );
}
