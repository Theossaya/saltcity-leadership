import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { QueryNotice } from "@/components/ui/query-notice";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Counter } from "@/components/v2/primitives/counter";
import {
  DateTile,
  EventCard as V2EventCard,
} from "@/components/v2/modules/event-card";
import { Pill } from "@/components/v2/primitives/pill";
import { getCurrentUser } from "@/features/auth/get-current-user";
import {
  getAdminEvents,
  getLeaderEvents,
  type EventListItem,
  type EventOverview,
  type EventStatus,
} from "@/features/events/queries";

const regularServices = [
  { day: "Sunday", time: "9:00-13:00", note: "Main service", start: "09" },
  {
    day: "Wednesday",
    time: "17:00-19:30",
    note: "Midweek service",
    start: "17",
  },
  { day: "Friday", time: "17:00-19:30", note: "Prayer service", start: "17" },
];

const statusLabels: Record<EventStatus, string> = {
  planning: "Planning",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDateParts(value: string) {
  const date = new Date(value);

  return {
    month: new Intl.DateTimeFormat("en", {
      month: "short",
      timeZone: "Africa/Lagos",
    }).format(date),
    date: new Intl.DateTimeFormat("en", {
      day: "2-digit",
      timeZone: "Africa/Lagos",
    }).format(date),
    day: new Intl.DateTimeFormat("en", {
      weekday: "short",
      timeZone: "Africa/Lagos",
    }).format(date),
  };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function formatEventMeta(event: EventListItem) {
  const time = event.endsAt
    ? `${formatTime(event.startsAt)} - ${formatTime(event.endsAt)}`
    : formatTime(event.startsAt);

  return `${time} · ${event.location ?? "Location to be confirmed"}`;
}

function statusTone(status: EventStatus) {
  if (status === "cancelled") {
    return "urgent";
  }

  if (status === "completed") {
    return "ok";
  }

  return "care";
}

function isClosedEvent(event: EventListItem) {
  return event.status === "completed" || event.status === "cancelled";
}

function getEventStart(event: EventListItem) {
  return new Date(event.startsAt);
}

function getEventActiveUntil(event: EventListItem) {
  return new Date(event.endsAt ?? event.startsAt);
}

function EmptyCalendar({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <h2 className="font-serif text-[18px] font-medium leading-tight text-ink text-pretty">
        {title}
      </h2>
      <p className="mt-2 font-sans text-sm leading-6 text-ink-2">{message}</p>
    </section>
  );
}

function RestrictedState() {
  return (
    <>
      <V2Sect>Calendar access</V2Sect>
      <EmptyCalendar
        title="Events are limited to leaders."
        message="Service and leadership calendar visibility is for active church leaders and church admins."
      />
    </>
  );
}

function RegularScheduleSection() {
  return (
    <>
      <V2Sect action="Weekly rhythm">Regular schedule</V2Sect>
      <section className="rounded-card bg-surface p-[18px] shadow-lift">
        {regularServices.map((service) => (
          <div
            key={service.day}
            className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 [&+&]:shadow-[inset_0_1px_0_var(--rule)]"
          >
            <DateTile
              month={service.day.slice(0, 3)}
              date={service.start}
              day="Wkly"
            />
            <div className="min-w-0 flex-1">
              <h2 className="font-serif text-[17px] font-medium leading-[1.2] tracking-[-0.005em] text-ink">
                {service.day}
              </h2>
              <p className="mt-1 font-sans text-[12.5px] leading-[1.45] text-ink-3">
                {service.time} · {service.note}
              </p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function EventModule({
  event,
  featured = false,
  eventLabel,
}: {
  event: EventListItem;
  featured?: boolean;
  eventLabel?: string;
}) {
  const parts = formatDateParts(event.startsAt);

  return (
    <div className="grid gap-2">
      <V2EventCard
        month={parts.month}
        date={parts.date}
        day={parts.day}
        title={event.title}
        eyebrow={event.audienceLabel ?? "Leadership"}
        meta={formatEventMeta(event)}
      />
      <div className="flex flex-wrap items-center gap-2 px-1">
        <Pill tone={statusTone(event.status)}>{statusLabels[event.status]}</Pill>
        {eventLabel ? <Pill tone="quiet">{eventLabel}</Pill> : null}
        {featured ? <Pill tone="quiet">Next up</Pill> : null}
      </div>
      {event.description ? (
        <p className="rounded-card bg-surface-2 p-[18px] whitespace-pre-wrap break-words font-sans text-[13px] leading-[1.55] text-ink-2">
          {event.description}
        </p>
      ) : null}
    </div>
  );
}

function EventList({
  events,
  emptyTitle,
  emptyMessage,
  featureFirst = false,
  eventLabel,
}: {
  events: EventListItem[];
  emptyTitle: string;
  emptyMessage: string;
  featureFirst?: boolean;
  eventLabel?: string;
}) {
  if (events.length === 0) {
    return (
      <EmptyCalendar
        title={emptyTitle}
        message={emptyMessage}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event, index) => (
        <EventModule
          key={event.id}
          event={event}
          featured={featureFirst && index === 0}
          eventLabel={eventLabel}
        />
      ))}
    </div>
  );
}

function EventsOverview({ overview }: { overview: EventOverview }) {
  const now = new Date();
  const ongoingEvents = overview.events.filter((event) => {
    const startsAt = getEventStart(event);
    const activeUntil = getEventActiveUntil(event);

    return !isClosedEvent(event) && startsAt <= now && activeUntil >= now;
  });
  const upcomingEvents = overview.events.filter(
    (event) => !isClosedEvent(event) && getEventStart(event) > now,
  );
  const scheduleChangeEvents = overview.events.filter(
    (event) => isClosedEvent(event) && getEventActiveUntil(event) >= now,
  );
  const recentPastEvents = overview.events.filter(
    (event) => getEventActiveUntil(event) < now,
  );

  return (
    <>
      <section className="mt-[18px] grid grid-cols-2 gap-3 rounded-card bg-surface p-[18px] shadow-lift sm:grid-cols-4">
        <Counter value={ongoingEvents.length} label="Current" />
        <Counter value={upcomingEvents.length} label="Upcoming" />
        <Counter value={overview.summary.thisWeek} label="This week" />
        <Counter value={overview.summary.regularServices} label="Services" />
      </section>

      <RegularScheduleSection />

      {ongoingEvents.length > 0 ? (
        <>
          <V2Sect action={`${ongoingEvents.length}`}>Happening now</V2Sect>
          <EventList
            events={ongoingEvents}
            emptyTitle="No events are happening now."
            emptyMessage="Events in progress will appear here during their scheduled time."
            eventLabel="In progress"
          />
        </>
      ) : null}

      <V2Sect action={`${upcomingEvents.length}`}>Upcoming</V2Sect>
      <EventList
        events={upcomingEvents}
        emptyTitle="No upcoming leadership events yet."
        emptyMessage="The regular service schedule remains above. Special gatherings will appear here when configured."
        featureFirst
      />

      {scheduleChangeEvents.length > 0 ? (
        <>
          <V2Sect action={`${scheduleChangeEvents.length}`}>
            Schedule changes
          </V2Sect>
          <EventList
            events={scheduleChangeEvents}
            emptyTitle="No schedule changes to show."
            emptyMessage="Cancelled or completed scheduled events will appear here while they are still current."
          />
        </>
      ) : null}

      {recentPastEvents.length > 0 ? (
        <>
          <V2Sect action={`${recentPastEvents.length}`}>Recently passed</V2Sect>
          <EventList
            events={recentPastEvents}
            emptyTitle="No recent events to show."
            emptyMessage="Recently passed leadership events will appear here for a short time."
          />
        </>
      ) : null}
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

  let content = <RestrictedState />;

  if (!churchId) {
    content = (
      <>
        <V2Sect>Calendar access</V2Sect>
        <EmptyCalendar
          title="Active church membership needed."
          message="Event visibility depends on an active church membership. Ask an admin to confirm your access."
        />
      </>
    );
  } else if (isAdmin) {
    const eventsResult = await getAdminEvents(churchId);

    content = (
      <>
        {eventsResult.error ? (
          <QueryNotice message="We could not load the church calendar. Try again shortly." />
        ) : null}
        <EventsOverview overview={eventsResult.data} />
      </>
    );
  } else if (isLeader) {
    const eventsResult = await getLeaderEvents(user.id, churchId);

    content = (
      <>
        {eventsResult.error ? (
          <QueryNotice message="We could not load leadership events. Try again shortly." />
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
      <V2Greeting
        eyebrow="Leadership calendar"
        title={
          <>
            Services & <em>gatherings.</em>
          </>
        }
        subtitle="The standing service rhythm and upcoming leadership events in one calm calendar."
      />

      {content}
    </AppShell>
  );
}
