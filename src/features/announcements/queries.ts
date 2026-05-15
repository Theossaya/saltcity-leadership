import { createClient } from "@/lib/supabase/server";

export type AnnouncementAudienceType =
  | "all_leaders"
  | "company"
  | "unit"
  | "role";

export type AnnouncementListItem = {
  id: string;
  title: string;
  message: string;
  audienceType: AnnouncementAudienceType;
  audienceLabel: string;
  isUrgent: boolean;
  isExpired: boolean;
  createdByName: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AnnouncementSummary = {
  total: number;
  active: number;
  urgent: number;
  expired: number;
  hasExpiry: boolean;
};

export type AnnouncementOverview = {
  announcements: AnnouncementListItem[];
  summary: AnnouncementSummary;
};

export type AnnouncementQueryResult<T> = {
  data: T;
  error: string | null;
};

type AnnouncementRow = {
  id: string;
  church_id: string;
  title: string;
  message: string;
  audience_type: AnnouncementAudienceType;
  audience_company_id: string | null;
  audience_unit_id: string | null;
  audience_role: string | null;
  is_urgent: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type AudienceTargetRow = {
  id: string;
  name: string;
};

const emptyOverview: AnnouncementOverview = {
  announcements: [],
  summary: {
    total: 0,
    active: 0,
    urgent: 0,
    expired: 0,
    hasExpiry: false,
  },
};

function toErrorMessage(scope: string, message: string) {
  return `${scope}: ${message}`;
}

function uniqueIds(ids: Array<string | null>) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

function formatRoleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isExpired(expiresAt: string | null) {
  return Boolean(expiresAt && new Date(expiresAt) <= new Date());
}

function summarize(announcements: AnnouncementListItem[]): AnnouncementSummary {
  return {
    total: announcements.length,
    active: announcements.filter((announcement) => !announcement.isExpired)
      .length,
    urgent: announcements.filter((announcement) => announcement.isUrgent)
      .length,
    expired: announcements.filter((announcement) => announcement.isExpired)
      .length,
    hasExpiry: announcements.some((announcement) =>
      Boolean(announcement.expiresAt),
    ),
  };
}

function getAudienceLabel(
  announcement: AnnouncementRow,
  companiesById: Map<string, AudienceTargetRow>,
  unitsById: Map<string, AudienceTargetRow>,
) {
  if (announcement.audience_type === "all_leaders") {
    return "All leaders";
  }

  if (announcement.audience_type === "role" && announcement.audience_role) {
    return formatRoleLabel(announcement.audience_role);
  }

  if (
    announcement.audience_type === "company" &&
    announcement.audience_company_id
  ) {
    return (
      companiesById.get(announcement.audience_company_id)?.name ??
      "Company leaders"
    );
  }

  if (announcement.audience_type === "unit" && announcement.audience_unit_id) {
    return unitsById.get(announcement.audience_unit_id)?.name ?? "Unit leaders";
  }

  return "Leadership";
}

function sortAnnouncements(first: AnnouncementRow, second: AnnouncementRow) {
  if (first.is_urgent && !second.is_urgent) {
    return -1;
  }

  if (!first.is_urgent && second.is_urgent) {
    return 1;
  }

  return second.created_at.localeCompare(first.created_at);
}

async function enrichAnnouncements(
  announcements: AnnouncementRow[],
): Promise<AnnouncementQueryResult<AnnouncementOverview>> {
  if (announcements.length === 0) {
    return {
      data: emptyOverview,
      error: null,
    };
  }

  const supabase = await createClient();
  const creatorIds = uniqueIds(
    announcements.map((announcement) => announcement.created_by),
  );
  const companyIds = uniqueIds(
    announcements.map((announcement) => announcement.audience_company_id),
  );
  const unitIds = uniqueIds(
    announcements.map((announcement) => announcement.audience_unit_id),
  );

  const [
    { data: profilesData, error: profilesError },
    { data: companiesData, error: companiesError },
    { data: unitsData, error: unitsError },
  ] = await Promise.all([
    creatorIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
          .returns<ProfileRow[]>()
      : Promise.resolve({ data: [], error: null }),
    companyIds.length > 0
      ? supabase
          .from("companies")
          .select("id, name")
          .in("id", companyIds)
          .returns<AudienceTargetRow[]>()
      : Promise.resolve({ data: [], error: null }),
    unitIds.length > 0
      ? supabase
          .from("units")
          .select("id, name")
          .in("id", unitIds)
          .returns<AudienceTargetRow[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  const profilesById = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Leadership admin",
    ]),
  );
  const companiesById = new Map(
    (companiesData ?? []).map((company) => [company.id, company]),
  );
  const unitsById = new Map((unitsData ?? []).map((unit) => [unit.id, unit]));

  const items = announcements.sort(sortAnnouncements).map((announcement) => ({
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    audienceType: announcement.audience_type,
    audienceLabel: getAudienceLabel(announcement, companiesById, unitsById),
    isUrgent: announcement.is_urgent,
    isExpired: isExpired(announcement.expires_at),
    createdByName: announcement.created_by
      ? profilesById.get(announcement.created_by) ?? "Leadership admin"
      : null,
    expiresAt: announcement.expires_at,
    createdAt: announcement.created_at,
    updatedAt: announcement.updated_at,
  }));

  return {
    data: {
      announcements: items,
      summary: summarize(items),
    },
    error:
      [
        profilesError
          ? toErrorMessage(
              "Unable to load announcement authors",
              profilesError.message,
            )
          : null,
        companiesError
          ? toErrorMessage(
              "Unable to load announcement companies",
              companiesError.message,
            )
          : null,
        unitsError
          ? toErrorMessage("Unable to load announcement units", unitsError.message)
          : null,
      ]
        .filter(Boolean)
        .join(" ") || null,
  };
}

export async function getAdminAnnouncements(
  churchId: string,
): Promise<AnnouncementQueryResult<AnnouncementOverview>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(
      "id, church_id, title, message, audience_type, audience_company_id, audience_unit_id, audience_role, is_urgent, expires_at, created_by, created_at, updated_at",
    )
    .eq("church_id", churchId)
    .order("created_at", { ascending: false })
    .returns<AnnouncementRow[]>();

  if (error) {
    return {
      data: emptyOverview,
      error: toErrorMessage("Unable to load church announcements", error.message),
    };
  }

  return enrichAnnouncements(data ?? []);
}

export async function getLeaderAnnouncements(
  userId: string,
  churchId: string,
): Promise<AnnouncementQueryResult<AnnouncementOverview>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select(
      "id, church_id, title, message, audience_type, audience_company_id, audience_unit_id, audience_role, is_urgent, expires_at, created_by, created_at, updated_at",
    )
    .eq("church_id", churchId)
    .order("created_at", { ascending: false })
    .returns<AnnouncementRow[]>();

  if (error) {
    return {
      data: emptyOverview,
      error: toErrorMessage("Unable to load leadership announcements", error.message),
    };
  }

  void userId;

  return enrichAnnouncements(data ?? []);
}
