import { getCurrentReportWeek } from "@/features/reports/queries";
import { createClient } from "@/lib/supabase/server";

export type FollowUpStatus =
  | "not_started"
  | "open"
  | "assigned"
  | "contacted"
  | "resolved"
  | "escalated";

export type FollowUpQueueItem = {
  absenteeRecordId: string;
  memberName: string;
  companyName: string;
  absenceDate: string;
  reason: string;
  reasonNote: string | null;
  weeklyReportStatus: string;
  reportWeekStart: string;
  reportWeekEnd: string;
  followUpStatus: FollowUpStatus;
  hasFollowUpCase: boolean;
  assignedUserName: string | null;
  lastContactDate: string | null;
  followUpCaseCreatedAt: string | null;
  createdAt: string | null;
  isCurrentWeek: boolean;
};

export type FollowUpQueueSummary = {
  totalItems: number;
  notStarted: number;
  withCase: number;
  currentWeek: number;
};

export type FollowUpQueue = {
  week: {
    reportWeekStart: string;
    reportWeekEnd: string;
  };
  items: FollowUpQueueItem[];
  summary: FollowUpQueueSummary;
};

export type FollowUpQueryResult<T> = {
  data: T;
  error: string | null;
};

export type FollowUpCreateOptions = {
  assignees: Array<{
    id: string;
    name: string;
    role: string;
  }>;
};

type AbsenteeRecordRow = {
  id: string;
  weekly_report_id: string;
  company_id: string;
  company_member_id: string;
  absence_date: string;
  reason: string;
  reason_note: string | null;
  created_at: string | null;
};

type WeeklyReportRow = {
  id: string;
  status: string;
  report_week_start: string;
  report_week_end: string;
};

type CompanyRow = {
  id: string;
  name: string;
};

type CompanyMemberRow = {
  id: string;
  full_name: string;
};

type FollowUpCaseRow = {
  id: string;
  absentee_record_id: string | null;
  status: Exclude<FollowUpStatus, "not_started">;
  assigned_to: string | null;
  date_contacted: string | null;
  created_at: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type MembershipOptionRow = {
  user_id: string;
  role: string;
};

const RECENT_WEEK_COUNT = 4;

const emptyCreateOptions: FollowUpCreateOptions = {
  assignees: [],
};

function toErrorMessage(scope: string, message: string) {
  return `${scope}: ${message}`;
}

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getRecentWeekStart(currentWeekStart: string) {
  const start = new Date(`${currentWeekStart}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() - (RECENT_WEEK_COUNT - 1) * 7);

  return toDateInput(start);
}

function uniqueIds(ids: Array<string | null>) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

function emptyQueue(): FollowUpQueue {
  const week = getCurrentReportWeek();

  return {
    week,
    items: [],
    summary: {
      totalItems: 0,
      notStarted: 0,
      withCase: 0,
      currentWeek: 0,
    },
  };
}

function summarize(items: FollowUpQueueItem[]): FollowUpQueueSummary {
  return {
    totalItems: items.length,
    notStarted: items.filter((item) => item.followUpStatus === "not_started")
      .length,
    withCase: items.filter((item) => item.hasFollowUpCase).length,
    currentWeek: items.filter((item) => item.isCurrentWeek).length,
  };
}

async function getAssignedCompanyIds(userId: string, churchId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("church_id", churchId)
    .or(`leader_id.eq.${userId},assistant_leader_id.eq.${userId}`)
    .eq("status", "active")
    .returns<Array<{ id: string }>>();

  if (error) {
    return {
      companyIds: [],
      error: toErrorMessage("Unable to load assigned follow-up company", error.message),
    };
  }

  return {
    companyIds: (data ?? []).map((company) => company.id),
    error: null,
  };
}

async function getFollowUpQueue(
  churchId: string,
  companyIds?: string[],
): Promise<FollowUpQueryResult<FollowUpQueue>> {
  const supabase = await createClient();
  const week = getCurrentReportWeek();
  const recentWeekStart = getRecentWeekStart(week.reportWeekStart);
  const baseQueue = emptyQueue();

  let absenteeQuery = supabase
    .from("absentee_records")
    .select(
      "id, weekly_report_id, company_id, company_member_id, absence_date, reason, reason_note, created_at",
    )
    .eq("church_id", churchId)
    .gte("absence_date", recentWeekStart);

  if (companyIds) {
    if (companyIds.length === 0) {
      return {
        data: baseQueue,
        error: null,
      };
    }

    absenteeQuery = absenteeQuery.in("company_id", companyIds);
  }

  const { data: absenteeRecordsData, error: absenteeRecordsError } =
    await absenteeQuery
      .order("absence_date", { ascending: false })
      .order("created_at", { ascending: false })
      .returns<AbsenteeRecordRow[]>();

  if (absenteeRecordsError) {
    return {
      data: baseQueue,
      error: toErrorMessage("Unable to load absentee follow-up records", absenteeRecordsError.message),
    };
  }

  const absenteeRecords = absenteeRecordsData ?? [];

  if (absenteeRecords.length === 0) {
    return {
      data: baseQueue,
      error: null,
    };
  }

  const weeklyReportIds = uniqueIds(
    absenteeRecords.map((record) => record.weekly_report_id),
  );
  const companyRecordIds = uniqueIds(
    absenteeRecords.map((record) => record.company_id),
  );
  const companyMemberIds = uniqueIds(
    absenteeRecords.map((record) => record.company_member_id),
  );
  const absenteeRecordIds = absenteeRecords.map((record) => record.id);

  const [
    { data: reportsData, error: reportsError },
    { data: companiesData, error: companiesError },
    { data: membersData, error: membersError },
    { data: casesData, error: casesError },
  ] = await Promise.all([
    supabase
      .from("weekly_reports")
      .select("id, status, report_week_start, report_week_end")
      .eq("church_id", churchId)
      .in("id", weeklyReportIds)
      .returns<WeeklyReportRow[]>(),
    supabase
      .from("companies")
      .select("id, name")
      .eq("church_id", churchId)
      .in("id", companyRecordIds)
      .returns<CompanyRow[]>(),
    supabase
      .from("company_members")
      .select("id, full_name")
      .eq("church_id", churchId)
      .in("id", companyMemberIds)
      .returns<CompanyMemberRow[]>(),
    supabase
      .from("follow_up_cases")
      .select(
        "id, absentee_record_id, status, assigned_to, date_contacted, created_at",
      )
      .eq("church_id", churchId)
      .in("absentee_record_id", absenteeRecordIds)
      .returns<FollowUpCaseRow[]>(),
  ]);

  const cases = casesData ?? [];
  const assignedUserIds = uniqueIds(cases.map((followUpCase) => followUpCase.assigned_to));
  let profileNames = new Map<string, string>();
  let profileError: string | null = null;

  if (assignedUserIds.length > 0) {
    const { data: profilesData, error } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", assignedUserIds)
      .returns<ProfileRow[]>();

    profileNames = new Map(
      (profilesData ?? []).map((profile) => [
        profile.id,
        profile.full_name ?? "Assigned leader",
      ]),
    );
    profileError = error
      ? toErrorMessage("Unable to load follow-up assignees", error.message)
      : null;
  }

  const reportsById = new Map((reportsData ?? []).map((report) => [report.id, report]));
  const companiesById = new Map(
    (companiesData ?? []).map((company) => [company.id, company]),
  );
  const membersById = new Map((membersData ?? []).map((member) => [member.id, member]));
  const casesByAbsenteeRecordId = new Map<string, FollowUpCaseRow>();

  for (const followUpCase of cases) {
    if (followUpCase.absentee_record_id) {
      casesByAbsenteeRecordId.set(followUpCase.absentee_record_id, followUpCase);
    }
  }

  const items = absenteeRecords
    .map((record) => {
      const report = reportsById.get(record.weekly_report_id);
      const followUpCase = casesByAbsenteeRecordId.get(record.id);

      return {
        absenteeRecordId: record.id,
        memberName:
          membersById.get(record.company_member_id)?.full_name ??
          "Company member",
        companyName: companiesById.get(record.company_id)?.name ?? "Company",
        absenceDate: record.absence_date,
        reason: record.reason,
        reasonNote: record.reason_note,
        weeklyReportStatus: report?.status ?? "unknown",
        reportWeekStart: report?.report_week_start ?? record.absence_date,
        reportWeekEnd: report?.report_week_end ?? record.absence_date,
        followUpStatus: followUpCase?.status ?? "not_started",
        hasFollowUpCase: Boolean(followUpCase),
        assignedUserName: followUpCase?.assigned_to
          ? profileNames.get(followUpCase.assigned_to) ?? null
          : null,
        lastContactDate: followUpCase?.date_contacted ?? null,
        followUpCaseCreatedAt: followUpCase?.created_at ?? null,
        createdAt: record.created_at,
        isCurrentWeek: report?.report_week_start === week.reportWeekStart,
      } satisfies FollowUpQueueItem;
    })
    .filter((item) => item.followUpStatus !== "resolved")
    .sort((first, second) => {
      if (first.isCurrentWeek !== second.isCurrentWeek) {
        return first.isCurrentWeek ? -1 : 1;
      }

      return second.absenceDate.localeCompare(first.absenceDate);
    });

  return {
    data: {
      week,
      items,
      summary: summarize(items),
    },
    error:
      [
        reportsError
          ? toErrorMessage("Unable to load follow-up report details", reportsError.message)
          : null,
        companiesError
          ? toErrorMessage("Unable to load follow-up companies", companiesError.message)
          : null,
        membersError
          ? toErrorMessage("Unable to load follow-up members", membersError.message)
          : null,
        casesError
          ? toErrorMessage("Unable to load linked follow-up cases", casesError.message)
          : null,
        profileError,
      ]
        .filter(Boolean)
        .join(" ") || null,
  };
}

export async function getAdminFollowUpQueue(
  churchId: string,
): Promise<FollowUpQueryResult<FollowUpQueue>> {
  return getFollowUpQueue(churchId);
}

export async function getCompanyFollowUpQueue(
  userId: string,
  churchId: string,
): Promise<FollowUpQueryResult<FollowUpQueue>> {
  const assignedCompanies = await getAssignedCompanyIds(userId, churchId);

  if (assignedCompanies.error) {
    return {
      data: emptyQueue(),
      error: assignedCompanies.error,
    };
  }

  return getFollowUpQueue(churchId, assignedCompanies.companyIds);
}

export async function getFollowUpCreateOptions(
  churchId: string,
): Promise<FollowUpQueryResult<FollowUpCreateOptions>> {
  const supabase = await createClient();
  const { data: membershipsData, error: membershipsError } = await supabase
    .from("church_memberships")
    .select("user_id, role")
    .eq("church_id", churchId)
    .eq("status", "active")
    .order("role", { ascending: true })
    .returns<MembershipOptionRow[]>();

  if (membershipsError) {
    return {
      data: emptyCreateOptions,
      error: toErrorMessage(
        "Unable to load follow-up assignees",
        membershipsError.message,
      ),
    };
  }

  const memberships = membershipsData ?? [];
  const profileIds = uniqueIds(memberships.map((membership) => membership.user_id));
  const { data: profilesData, error: profilesError } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", profileIds)
          .returns<ProfileRow[]>()
      : { data: [], error: null };

  const profilesById = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Active leader",
    ]),
  );

  return {
    data: {
      assignees: memberships
        .map((membership) => ({
          id: membership.user_id,
          name: profilesById.get(membership.user_id) ?? "Active leader",
          role: membership.role,
        }))
        .sort((first, second) => first.name.localeCompare(second.name)),
    },
    error: profilesError
      ? toErrorMessage("Unable to load follow-up assignee names", profilesError.message)
      : null,
  };
}
