import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

export type LeadershipRole =
  | "super_admin"
  | "church_admin"
  | "company_leader"
  | "assistant_leader"
  | "unit_leader"
  | "general_leader";

type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
};

type ChurchMembership = {
  id: string;
  church_id: string;
  user_id: string;
  role: LeadershipRole;
  status: string;
};

type Church = {
  id: string;
  name: string;
};

type Company = {
  id: string;
  name: string;
};

const rolePriority: LeadershipRole[] = [
  "super_admin",
  "church_admin",
  "company_leader",
  "assistant_leader",
  "unit_leader",
  "general_leader",
];

function pickPrimaryMembership(memberships: ChurchMembership[]) {
  return memberships
    .slice()
    .sort(
      (first, second) =>
        rolePriority.indexOf(first.role) - rolePriority.indexOf(second.role),
    )[0];
}

export async function getCurrentUser(): Promise<{
  user: User | null;
  profile: Profile | null;
  memberships: ChurchMembership[];
  primaryRole: LeadershipRole | null;
  churchId: string | null;
  church: Church | null;
  assignedCompany: Company | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      memberships: [],
      primaryRole: null,
      churchId: null,
      church: null,
      assignedCompany: null,
    };
  }

  const [{ data: profile }, { data: membershipsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone, avatar_url")
      .eq("id", user.id)
      .maybeSingle<Profile>(),
    supabase
      .from("church_memberships")
      .select("id, church_id, user_id, role, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .returns<ChurchMembership[]>(),
  ]);

  const memberships = membershipsData ?? [];
  const primaryMembership = pickPrimaryMembership(memberships);
  const primaryRole = primaryMembership?.role ?? null;
  const churchId = primaryMembership?.church_id ?? null;

  let church: Church | null = null;
  let assignedCompany: Company | null = null;

  if (churchId) {
    const { data: churchData } = await supabase
      .from("churches")
      .select("id, name")
      .eq("id", churchId)
      .maybeSingle<Church>();

    church = churchData;
  }

  if (
    churchId &&
    (primaryRole === "company_leader" || primaryRole === "assistant_leader")
  ) {
    const { data: companyData } = await supabase
      .from("companies")
      .select("id, name")
      .eq("church_id", churchId)
      .or(`leader_id.eq.${user.id},assistant_leader_id.eq.${user.id}`)
      .eq("status", "active")
      .limit(1)
      .maybeSingle<Company>();

    assignedCompany = companyData;
  }

  return {
    user,
    profile,
    memberships,
    primaryRole,
    churchId,
    church,
    assignedCompany,
  };
}
