"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { getCurrentReportWeek } from "@/features/reports/queries";
import { createClient } from "@/lib/supabase/server";

const START_DRAFT_ERROR_PATH = "/reports?error=unable-to-start-draft";

type AssignedCompanyRow = {
  id: string;
};

type ExistingReportRow = {
  id: string;
};

function canStartReportDraft(role: string | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : null;
}

function isUuid(value: string | null): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

export async function startWeeklyReportDraft(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canStartReportDraft(primaryRole) || !churchId) {
    redirect(START_DRAFT_ERROR_PATH);
  }

  const supabase = await createClient();
  const { reportWeekStart, reportWeekEnd } = getCurrentReportWeek();
  const companyId = getFormString(formData, "companyId");

  if (!isUuid(companyId)) {
    redirect(START_DRAFT_ERROR_PATH);
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("church_id", churchId)
    .eq("id", companyId)
    .or(`leader_id.eq.${user.id},assistant_leader_id.eq.${user.id}`)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<AssignedCompanyRow>();

  if (companyError || !company) {
    redirect(START_DRAFT_ERROR_PATH);
  }

  const { data: existingReport, error: existingReportError } = await supabase
    .from("weekly_reports")
    .select("id")
    .eq("church_id", churchId)
    .eq("company_id", company.id)
    .eq("report_week_start", reportWeekStart)
    .maybeSingle<ExistingReportRow>();

  if (existingReportError) {
    redirect(START_DRAFT_ERROR_PATH);
  }

  if (!existingReport) {
    const { count } = await supabase
      .from("company_members")
      .select("id", { count: "exact", head: true })
      .eq("church_id", churchId)
      .eq("company_id", company.id)
      .eq("status", "active");

    const { error: insertError } = await supabase.from("weekly_reports").insert({
      church_id: churchId,
      company_id: company.id,
      report_week_start: reportWeekStart,
      report_week_end: reportWeekEnd,
      total_members: count ?? 0,
      present_count: 0,
      absent_count: 0,
      new_visitors_count: 0,
      status: "draft",
      submitted_by: null,
      submitted_at: null,
    });

    if (insertError && insertError.code !== "23505") {
      redirect(START_DRAFT_ERROR_PATH);
    }
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports");
}
