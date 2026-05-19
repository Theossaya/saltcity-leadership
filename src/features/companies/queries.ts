import { createClient } from "@/lib/supabase/server";

export type CompanyStatus = "active" | "inactive";
export type CompanyMemberStatus = "active" | "inactive";

export type CompanyLeadership = {
  id: string;
  name: string;
  status: CompanyStatus;
  leaderName: string | null;
  assistantLeaderName: string | null;
};

export type AdminCompanyOverview = CompanyLeadership & {
  memberCount: number;
};

export type ActiveCompanyOption = {
  id: string;
  name: string;
};

export type CompanyMember = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  status: CompanyMemberStatus;
  createdAt: string;
};

export type CompanyQueryResult<T> = {
  data: T;
  error: string | null;
};

type ProfileRow = {
  full_name: string | null;
};

type CompanyRow = {
  id: string;
  name: string;
  status: CompanyStatus;
  leader_id: string | null;
  assistant_leader_id: string | null;
};

type MemberCountRow = {
  company_id: string;
};

type CompanyMemberRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: CompanyMemberStatus;
  created_at: string;
};

function toErrorMessage(scope: string, message: string) {
  return `${scope}: ${message}`;
}

function collectProfileIds(companies: CompanyRow[]) {
  return Array.from(
    new Set(
      companies
        .flatMap((company) => [company.leader_id, company.assistant_leader_id])
        .filter((id): id is string => Boolean(id)),
    ),
  );
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
    .returns<(ProfileRow & { id: string })[]>();

  if (error) {
    return {
      names: new Map<string, string>(),
      error: toErrorMessage("Unable to load company leader names", error.message),
    };
  }

  return {
    names: new Map(
      (data ?? []).map((profile) => [profile.id, profile.full_name ?? ""]),
    ),
    error: null,
  };
}

function mapCompany(
  company: CompanyRow,
  profileNames: Map<string, string>,
): CompanyLeadership {
  return {
    id: company.id,
    name: company.name,
    status: company.status,
    leaderName: company.leader_id
      ? profileNames.get(company.leader_id) || null
      : null,
    assistantLeaderName: company.assistant_leader_id
      ? profileNames.get(company.assistant_leader_id) || null
      : null,
  };
}

export async function getAdminCompaniesOverview(
  churchId: string,
): Promise<CompanyQueryResult<AdminCompanyOverview[]>> {
  const supabase = await createClient();

  const { data: companiesData, error: companiesError } = await supabase
    .from("companies")
    .select("id, name, status, leader_id, assistant_leader_id")
    .eq("church_id", churchId)
    .order("name", { ascending: true })
    .returns<CompanyRow[]>();

  if (companiesError) {
    return {
      data: [],
      error: toErrorMessage(
        "Unable to load companies",
        companiesError.message,
      ),
    };
  }

  const companies = companiesData ?? [];

  if (companies.length === 0) {
    return {
      data: [],
      error: null,
    };
  }

  const [{ data: membersData, error: membersError }, profileResult] =
    await Promise.all([
      supabase
        .from("company_members")
        .select("company_id")
        .eq("church_id", churchId)
        .eq("status", "active")
        .returns<MemberCountRow[]>(),
      getProfileNames(collectProfileIds(companies)),
    ]);

  const countByCompany = new Map<string, number>();

  for (const member of membersData ?? []) {
    countByCompany.set(
      member.company_id,
      (countByCompany.get(member.company_id) ?? 0) + 1,
    );
  }

  const error =
    membersError?.message || profileResult.error
      ? [
          membersError
            ? toErrorMessage("Unable to load company member counts", membersError.message)
            : null,
          profileResult.error,
        ]
          .filter(Boolean)
          .join(" ")
      : null;

  return {
    data: companies.map((company) => ({
      ...mapCompany(company, profileResult.names),
      memberCount: countByCompany.get(company.id) ?? 0,
    })),
    error,
  };
}

export async function getActiveCompaniesForMemberCreate(
  churchId: string,
): Promise<CompanyQueryResult<ActiveCompanyOption[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id, name")
    .eq("church_id", churchId)
    .eq("status", "active")
    .order("name", { ascending: true })
    .returns<ActiveCompanyOption[]>();

  if (error) {
    return {
      data: [],
      error: toErrorMessage(
        "Unable to load active companies for member creation",
        error.message,
      ),
    };
  }

  return {
    data: data ?? [],
    error: null,
  };
}

export async function getAssignedCompanyDetails(
  userId: string,
  churchId: string,
): Promise<CompanyQueryResult<CompanyLeadership | null>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("id, name, status, leader_id, assistant_leader_id")
    .eq("church_id", churchId)
    .or(`leader_id.eq.${userId},assistant_leader_id.eq.${userId}`)
    .order("name", { ascending: true })
    .limit(1)
    .maybeSingle<CompanyRow>();

  if (error) {
    return {
      data: null,
      error: toErrorMessage("Unable to load assigned company", error.message),
    };
  }

  if (!data) {
    return {
      data: null,
      error: null,
    };
  }

  const profileResult = await getProfileNames(collectProfileIds([data]));

  return {
    data: mapCompany(data, profileResult.names),
    error: profileResult.error,
  };
}

export async function getCompanyMembers(
  companyId: string,
  churchId: string,
): Promise<CompanyQueryResult<CompanyMember[]>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("company_members")
    .select("id, full_name, phone, email, status, created_at")
    .eq("church_id", churchId)
    .eq("company_id", companyId)
    .order("full_name", { ascending: true })
    .returns<CompanyMemberRow[]>();

  if (error) {
    return {
      data: [],
      error: toErrorMessage("Unable to load company members", error.message),
    };
  }

  return {
    data: (data ?? []).map((member) => ({
      id: member.id,
      fullName: member.full_name,
      phone: member.phone,
      email: member.email,
      status: member.status,
      createdAt: member.created_at,
    })),
    error: null,
  };
}
