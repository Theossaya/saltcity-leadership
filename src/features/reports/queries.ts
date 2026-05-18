import { createClient } from "@/lib/supabase/server";

// TODO: Move this to church-specific timezone config when multi-church reporting needs it.
const APP_REPORT_TIME_ZONE = "Africa/Lagos";

export type ReportStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "reviewed"
  | "flagged";

export type ReportWeekRange = {
  reportWeekStart: string;
  reportWeekEnd: string;
};

export type ReportQueryResult<T> = {
  data: T;
  error: string | null;
};

export type ReportCompany = {
  id: string;
  name: string;
  status: "active" | "inactive";
};

export type WeeklyReportSummary = {
  id: string;
  companyId: string;
  reportWeekStart: string;
  reportWeekEnd: string;
  status: ReportStatus;
  submittedAt: string | null;
  submittedBy: string | null;
  totalMembers: number;
  presentCount: number;
  absentCount: number;
  newVisitorsCount: number;
  generalNotes: string | null;
  supportNeeded: string | null;
  testimonies: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewerNotes: string | null;
};

export type CompanyMemberOption = {
  id: string;
  fullName: string;
};

export type AbsenteeRecordSummary = {
  id: string;
  companyMemberId: string;
  companyMemberName: string;
  absenceDate: string;
  reason: string;
  reasonNote: string | null;
};

export type CompanyReportWorkspace = {
  company: ReportCompany | null;
  week: ReportWeekRange;
  report: WeeklyReportSummary | null;
  reportStatus: ReportStatus;
  lastSubmittedReport: WeeklyReportSummary | null;
  activeCompanyMembers: CompanyMemberOption[];
  absenteeRecords: AbsenteeRecordSummary[];
  absenteeCount: number;
};

export type AdminReportCompanyRow = {
  company: ReportCompany;
  reportId: string | null;
  leaderName: string | null;
  reportStatus: ReportStatus;
  submittedAt: string | null;
  submittedByName: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  reviewerNotes: string | null;
  totalMembers: number | null;
  presentCount: number | null;
  absentCount: number | null;
  newVisitorsCount: number | null;
  generalNotes: string | null;
  supportNeeded: string | null;
  testimonies: string | null;
  absenteeCount: number;
  canReview: boolean;
};

export type AdminReportsOverview = {
  week: ReportWeekRange;
  summary: {
    totalCompanies: number;
    submittedReports: number;
    missingReports: number;
    draftReports: number;
    flaggedReports: number;
  };
  rows: AdminReportCompanyRow[];
};

type CompanyRow = {
  id: string;
  name: string;
  status: "active" | "inactive";
  leader_id: string | null;
  assistant_leader_id: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type WeeklyReportRow = {
  id: string;
  company_id: string;
  report_week_start: string;
  report_week_end: string;
  status: ReportStatus;
  submitted_at: string | null;
  submitted_by: string | null;
  total_members: number;
  present_count: number;
  absent_count: number;
  new_visitors_count: number;
  general_notes: string | null;
  support_needed: string | null;
  testimonies: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
};

type CompanyMemberRow = {
  id: string;
  full_name: string;
};

type AbsenteeRecordRow = {
  id: string;
  weekly_report_id: string;
  company_member_id: string;
  absence_date: string;
  reason: string;
  reason_note: string | null;
};

const WEEKLY_REPORT_SUMMARY_SELECT =
  "id, company_id, report_week_start, report_week_end, status, submitted_at, submitted_by, total_members, present_count, absent_count, new_visitors_count, general_notes, support_needed, testimonies, reviewed_by, reviewed_at, reviewer_notes";

function toDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getReportLocalDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: APP_REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const dateParts = new Map(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(dateParts.get("year")),
    month: Number(dateParts.get("month")),
    day: Number(dateParts.get("day")),
  };
}

function toErrorMessage(scope: string, message: string) {
  return `${scope}: ${message}`;
}

function collectProfileIds(ids: Array<string | null>) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

function mapReport(
  report: WeeklyReportRow,
  profileNames = new Map<string, string>(),
): WeeklyReportSummary {
  return {
    id: report.id,
    companyId: report.company_id,
    reportWeekStart: report.report_week_start,
    reportWeekEnd: report.report_week_end,
    status: report.status,
    submittedAt: report.submitted_at,
    submittedBy: report.submitted_by
      ? profileNames.get(report.submitted_by) || null
      : null,
    totalMembers: report.total_members,
    presentCount: report.present_count,
    absentCount: report.absent_count,
    newVisitorsCount: report.new_visitors_count,
    generalNotes: report.general_notes,
    supportNeeded: report.support_needed,
    testimonies: report.testimonies,
    reviewedBy: report.reviewed_by
      ? profileNames.get(report.reviewed_by) || null
      : null,
    reviewedAt: report.reviewed_at,
    reviewerNotes: report.reviewer_notes,
  };
}

function mapCompany(company: CompanyRow): ReportCompany {
  return {
    id: company.id,
    name: company.name,
    status: company.status,
  };
}

function mapCompanyMember(member: CompanyMemberRow): CompanyMemberOption {
  return {
    id: member.id,
    fullName: member.full_name,
  };
}

function mapAbsenteeRecord(
  absenteeRecord: AbsenteeRecordRow,
  memberNames = new Map<string, string>(),
): AbsenteeRecordSummary {
  return {
    id: absenteeRecord.id,
    companyMemberId: absenteeRecord.company_member_id,
    companyMemberName:
      memberNames.get(absenteeRecord.company_member_id) || "Company member",
    absenceDate: absenteeRecord.absence_date,
    reason: absenteeRecord.reason,
    reasonNote: absenteeRecord.reason_note,
  };
}

async function getProfileNames(profileIds: string[]) {
  if (profileIds.length === 0) {
    return {
      names: new Map<string, string>(),
      error: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", profileIds)
    .returns<ProfileRow[]>();

  if (error) {
    return {
      names: new Map<string, string>(),
      error: toErrorMessage("Unable to load report profile names", error.message),
    };
  }

  return {
    names: new Map(
      (data ?? []).map((profile) => [profile.id, profile.full_name ?? ""]),
    ),
    error: null,
  };
}

export function getCurrentReportWeek(): ReportWeekRange {
  const localDate = getReportLocalDate(new Date());
  const today = new Date(
    Date.UTC(localDate.year, localDate.month - 1, localDate.day),
  );
  const day = today.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(today);
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  return {
    reportWeekStart: toDateInput(monday),
    reportWeekEnd: toDateInput(sunday),
  };
}

export async function getCompanyReportWorkspace(
  userId: string,
  churchId: string,
): Promise<ReportQueryResult<CompanyReportWorkspace>> {
  const supabase = await createClient();
  const week = getCurrentReportWeek();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, name, status, leader_id, assistant_leader_id")
    .eq("church_id", churchId)
    .or(`leader_id.eq.${userId},assistant_leader_id.eq.${userId}`)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle<CompanyRow>();

  if (companyError) {
    return {
      data: {
        company: null,
        week,
        report: null,
        reportStatus: "not_started",
        lastSubmittedReport: null,
        activeCompanyMembers: [],
        absenteeRecords: [],
        absenteeCount: 0,
      },
      error: toErrorMessage("Unable to load assigned report company", companyError.message),
    };
  }

  if (!company) {
    return {
      data: {
        company: null,
        week,
        report: null,
        reportStatus: "not_started",
        lastSubmittedReport: null,
        activeCompanyMembers: [],
        absenteeRecords: [],
        absenteeCount: 0,
      },
      error: null,
    };
  }

  const [
    { data: currentReport, error: reportError },
    { data: lastSubmitted },
    { data: membersData, error: membersError },
  ] = await Promise.all([
      supabase
        .from("weekly_reports")
        .select(WEEKLY_REPORT_SUMMARY_SELECT)
        .eq("church_id", churchId)
        .eq("company_id", company.id)
        .eq("report_week_start", week.reportWeekStart)
        .maybeSingle<WeeklyReportRow>(),
      supabase
        .from("weekly_reports")
        .select(WEEKLY_REPORT_SUMMARY_SELECT)
        .eq("church_id", churchId)
        .eq("company_id", company.id)
        .eq("status", "submitted")
        .order("submitted_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle<WeeklyReportRow>(),
      supabase
        .from("company_members")
        .select("id, full_name")
        .eq("church_id", churchId)
        .eq("company_id", company.id)
        .eq("status", "active")
        .order("full_name", { ascending: true })
        .returns<CompanyMemberRow[]>(),
    ]);

  const activeCompanyMembers = (membersData ?? []).map(mapCompanyMember);
  let absenteeRecords: AbsenteeRecordSummary[] = [];
  let absenteeError: string | null = null;

  if (currentReport) {
    const { data: absenteeData, error: absenteeRecordsError } = await supabase
      .from("absentee_records")
      .select(
        "id, weekly_report_id, company_member_id, absence_date, reason, reason_note",
      )
      .eq("church_id", churchId)
      .eq("company_id", company.id)
      .eq("weekly_report_id", currentReport.id)
      .order("created_at", { ascending: true })
      .returns<AbsenteeRecordRow[]>();

    const memberNames = new Map(
      activeCompanyMembers.map((member) => [member.id, member.fullName]),
    );

    absenteeRecords = (absenteeData ?? []).map((absenteeRecord) =>
      mapAbsenteeRecord(absenteeRecord, memberNames),
    );
    absenteeError = absenteeRecordsError
      ? toErrorMessage("Unable to load absentee records", absenteeRecordsError.message)
      : null;
  }

  const submittedByIds = collectProfileIds([
    currentReport?.submitted_by ?? null,
    lastSubmitted?.submitted_by ?? null,
  ]);
  const profileResult = await getProfileNames(submittedByIds);
  const error = [
    reportError
      ? toErrorMessage("Unable to load current weekly report", reportError.message)
      : null,
    membersError
      ? toErrorMessage("Unable to load company members", membersError.message)
      : null,
    absenteeError,
    profileResult.error,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    data: {
      company: mapCompany(company),
      week,
      report: currentReport ? mapReport(currentReport, profileResult.names) : null,
      reportStatus: currentReport?.status ?? "not_started",
      lastSubmittedReport: lastSubmitted
        ? mapReport(lastSubmitted, profileResult.names)
        : null,
      activeCompanyMembers,
      absenteeRecords,
      absenteeCount: absenteeRecords.length,
    },
    error: error || null,
  };
}

export async function getAdminReportsOverview(
  churchId: string,
): Promise<ReportQueryResult<AdminReportsOverview>> {
  const supabase = await createClient();
  const week = getCurrentReportWeek();

  const { data: companiesData, error: companiesError } = await supabase
    .from("companies")
    .select("id, name, status, leader_id, assistant_leader_id")
    .eq("church_id", churchId)
    .order("name", { ascending: true })
    .returns<CompanyRow[]>();

  const emptyOverview: AdminReportsOverview = {
    week,
    summary: {
      totalCompanies: 0,
      submittedReports: 0,
      missingReports: 0,
      draftReports: 0,
      flaggedReports: 0,
    },
    rows: [],
  };

  if (companiesError) {
    return {
      data: emptyOverview,
      error: toErrorMessage("Unable to load report companies", companiesError.message),
    };
  }

  const companies = companiesData ?? [];

  if (companies.length === 0) {
    return {
      data: emptyOverview,
      error: null,
    };
  }

  const companyIds = companies.map((company) => company.id);
  const { data: reportsData, error: reportsError } = await supabase
    .from("weekly_reports")
    .select(WEEKLY_REPORT_SUMMARY_SELECT)
    .eq("church_id", churchId)
    .eq("report_week_start", week.reportWeekStart)
    .in("company_id", companyIds)
    .returns<WeeklyReportRow[]>();

  const reports = reportsData ?? [];
  const reportIds = reports.map((report) => report.id);
  let absenteeCounts = new Map<string, number>();
  let absenteeCountsError: string | null = null;

  if (reportIds.length > 0) {
    const { data: absenteeData, error: absenteeError } = await supabase
      .from("absentee_records")
      .select("id, weekly_report_id")
      .eq("church_id", churchId)
      .in("weekly_report_id", reportIds)
      .returns<Array<{ id: string; weekly_report_id: string }>>();

    absenteeCounts = new Map<string, number>();

    for (const absenteeRecord of absenteeData ?? []) {
      absenteeCounts.set(
        absenteeRecord.weekly_report_id,
        (absenteeCounts.get(absenteeRecord.weekly_report_id) ?? 0) + 1,
      );
    }

    absenteeCountsError = absenteeError
      ? toErrorMessage("Unable to load absentee counts", absenteeError.message)
      : null;
  }

  const profileResult = await getProfileNames(
    collectProfileIds([
      ...companies.map((company) => company.leader_id),
      ...reports.map((report) => report.submitted_by),
      ...reports.map((report) => report.reviewed_by),
    ]),
  );
  const reportsByCompany = new Map(
    reports.map((report) => [report.company_id, report]),
  );

  const rows = companies.map((company) => {
    const report = reportsByCompany.get(company.id);

    return {
      company: mapCompany(company),
      reportId: report?.id ?? null,
      leaderName: company.leader_id
        ? profileResult.names.get(company.leader_id) || null
        : null,
      reportStatus: report?.status ?? "not_started",
      submittedAt: report?.submitted_at ?? null,
      submittedByName: report?.submitted_by
        ? profileResult.names.get(report.submitted_by) || null
        : null,
      reviewedAt: report?.reviewed_at ?? null,
      reviewedByName: report?.reviewed_by
        ? profileResult.names.get(report.reviewed_by) || null
        : null,
      reviewerNotes: report?.reviewer_notes ?? null,
      totalMembers: report?.total_members ?? null,
      presentCount: report?.present_count ?? null,
      absentCount: report?.absent_count ?? null,
      newVisitorsCount: report?.new_visitors_count ?? null,
      generalNotes: report?.general_notes ?? null,
      supportNeeded: report?.support_needed ?? null,
      testimonies: report?.testimonies ?? null,
      absenteeCount: report ? absenteeCounts.get(report.id) ?? 0 : 0,
      canReview: report?.status === "submitted",
    };
  });

  // submittedReports means reports received, including reviewed and flagged states.
  const submittedReports = rows.filter((row) =>
    ["submitted", "reviewed", "flagged"].includes(row.reportStatus),
  ).length;
  const missingReports = rows.filter(
    (row) => row.reportStatus === "not_started",
  ).length;
  const draftReports = rows.filter((row) => row.reportStatus === "draft").length;
  const flaggedReports = rows.filter(
    (row) => row.reportStatus === "flagged",
  ).length;

  return {
    data: {
      week,
      summary: {
        totalCompanies: companies.length,
        submittedReports,
        missingReports,
        draftReports,
        flaggedReports,
      },
      rows,
    },
    error:
      [
        reportsError
          ? toErrorMessage("Unable to load current weekly reports", reportsError.message)
          : null,
        absenteeCountsError,
        profileResult.error,
      ]
        .filter(Boolean)
        .join(" ") || null,
  };
}
