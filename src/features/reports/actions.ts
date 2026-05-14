"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { getCurrentReportWeek } from "@/features/reports/queries";
import { createClient } from "@/lib/supabase/server";
import { createDraftWeeklyReportUpdateSchema } from "@/lib/validation/reports";

const START_DRAFT_ERROR_PATH = "/reports?error=unable-to-start-draft";
const UPDATE_DRAFT_ERROR_PATH = "/reports?error=unable-to-update-draft";

type AssignedCompanyRow = {
  id: string;
};

type ExistingReportRow = {
  id: string;
};

type DraftReportRow = {
  id: string;
  company_id: string;
  church_id: string;
  report_week_start: string;
  report_week_end: string;
  status: string;
};

function canStartReportDraft(role: string | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function canUpdateReportDraft(role: string | null) {
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

export async function updateDraftWeeklyReport(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canUpdateReportDraft(primaryRole) || !churchId) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  const supabase = await createClient();
  const { reportWeekStart, reportWeekEnd } = getCurrentReportWeek();
  const reportId = getFormString(formData, "reportId");
  const companyId = getFormString(formData, "companyId");

  if (!isUuid(reportId) || !isUuid(companyId)) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
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
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  const [{ data: report, error: reportError }, { count, error: countError }] =
    await Promise.all([
      supabase
        .from("weekly_reports")
        .select("id, company_id, church_id, report_week_start, report_week_end, status")
        .eq("church_id", churchId)
        .eq("company_id", company.id)
        .eq("id", reportId)
        .eq("report_week_start", reportWeekStart)
        .eq("report_week_end", reportWeekEnd)
        .eq("status", "draft")
        .maybeSingle<DraftReportRow>(),
      supabase
        .from("company_members")
        .select("id", { count: "exact", head: true })
        .eq("church_id", churchId)
        .eq("company_id", company.id)
        .eq("status", "active"),
    ]);

  if (reportError || countError || !report) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  const totalMembers = count ?? 0;
  const validation = createDraftWeeklyReportUpdateSchema(totalMembers).safeParse({
    reportId,
    companyId,
    presentCount: formData.get("presentCount"),
    absentCount: formData.get("absentCount"),
    newVisitorsCount: formData.get("newVisitorsCount"),
    generalNotes: formData.get("generalNotes"),
    supportNeeded: formData.get("supportNeeded"),
    testimonies: formData.get("testimonies"),
  });

  if (!validation.success) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  const values = validation.data;

  if (values.companyId !== company.id || values.reportId !== report.id) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  const { error: updateError } = await supabase
    .from("weekly_reports")
    .update({
      total_members: totalMembers,
      present_count: values.presentCount,
      absent_count: values.absentCount,
      new_visitors_count: values.newVisitorsCount,
      general_notes: values.generalNotes ?? null,
      support_needed: values.supportNeeded ?? null,
      testimonies: values.testimonies ?? null,
    })
    .eq("church_id", churchId)
    .eq("company_id", company.id)
    .eq("id", report.id)
    .eq("report_week_start", reportWeekStart)
    .eq("report_week_end", reportWeekEnd)
    .eq("status", "draft")
    .select("id")
    .single();

  if (updateError) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports?updated=draft");
}
