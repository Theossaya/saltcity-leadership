import { createClient } from "@/lib/supabase/server";

export type EventStatus = "planning" | "ready" | "completed" | "cancelled";

export type EventListItem = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  audienceLabel: string | null;
  status: EventStatus;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EventSummary = {
  total: number;
  upcoming: number;
  thisWeek: number;
  regularServices: number;
  hasSpecialProgrammeSupport: boolean;
};

export type EventOverview = {
  events: EventListItem[];
  summary: EventSummary;
};

export type EventQueryResult<T> = {
  data: T;
  error: string | null;
};

type EventRow = {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  venue: string | null;
  status: EventStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

const REGULAR_SERVICE_COUNT = 3;
const EVENT_LOOKBACK_DAYS = 7;

const emptyOverview: EventOverview = {
  events: [],
  summary: {
    total: 0,
    upcoming: 0,
    thisWeek: 0,
    regularServices: REGULAR_SERVICE_COUNT,
    hasSpecialProgrammeSupport: false,
  },
};

function toErrorMessage(scope: string, message: string) {
  return `${scope}: ${message}`;
}

function uniqueIds(ids: Array<string | null>) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

function getRelevantEventsCutoff(now = new Date()) {
  const cutoff = new Date(now);

  cutoff.setDate(cutoff.getDate() - EVENT_LOOKBACK_DAYS);

  return cutoff.toISOString();
}

function getWeekBounds(now: Date) {
  const start = new Date(now);
  const day = start.getDay();
  const daysSinceMonday = (day + 6) % 7;

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
}

function summarize(events: EventListItem[]): EventSummary {
  const now = new Date();
  const { start, end } = getWeekBounds(now);

  return {
    total: events.length,
    upcoming: events.filter((event) => new Date(event.startsAt) >= now).length,
    thisWeek: events.filter((event) => {
      const startsAt = new Date(event.startsAt);

      return startsAt >= start && startsAt < end;
    }).length,
    regularServices: REGULAR_SERVICE_COUNT,
    hasSpecialProgrammeSupport: false,
  };
}

function sortEvents(first: EventRow, second: EventRow) {
  return first.starts_at.localeCompare(second.starts_at);
}

async function enrichEvents(
  events: EventRow[],
): Promise<EventQueryResult<EventOverview>> {
  if (events.length === 0) {
    return {
      data: emptyOverview,
      error: null,
    };
  }

  const supabase = await createClient();
  const creatorIds = uniqueIds(events.map((event) => event.created_by));

  const { data: profilesData, error: profilesError } =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
          .returns<ProfileRow[]>()
      : { data: [], error: null };

  const profilesById = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Leadership admin",
    ]),
  );

  const items = events.sort(sortEvents).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    location: event.venue,
    audienceLabel: "All leaders",
    status: event.status,
    createdByName: event.created_by
      ? profilesById.get(event.created_by) ?? "Leadership admin"
      : null,
    createdAt: event.created_at,
    updatedAt: event.updated_at,
  }));

  return {
    data: {
      events: items,
      summary: summarize(items),
    },
    error: profilesError
      ? toErrorMessage("Unable to load event authors", profilesError.message)
      : null,
  };
}

async function getEventsForChurch(
  churchId: string,
  scope: string,
): Promise<EventQueryResult<EventOverview>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, church_id, title, description, starts_at, ends_at, venue, status, created_by, created_at, updated_at",
    )
    .eq("church_id", churchId)
    .gte("starts_at", getRelevantEventsCutoff())
    .order("starts_at", { ascending: true })
    .limit(50)
    .returns<EventRow[]>();

  if (error) {
    return {
      data: emptyOverview,
      error: toErrorMessage(scope, error.message),
    };
  }

  return enrichEvents(data ?? []);
}

export async function getAdminEvents(
  churchId: string,
): Promise<EventQueryResult<EventOverview>> {
  return getEventsForChurch(churchId, "Unable to load church events");
}

export async function getLeaderEvents(
  userId: string,
  churchId: string,
): Promise<EventQueryResult<EventOverview>> {
  void userId;

  return getEventsForChurch(churchId, "Unable to load leadership events");
}
