"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { getCurrentReportWeek } from "@/features/reports/queries";
import { createClient } from "@/lib/supabase/server";
import {
  absenteeRecordCreateSchema,
  absenteeRecordRemoveSchema,
} from "@/lib/validation/absentees";
import {
  draftWeeklyReportUpdateBaseSchema,
  submitWeeklyReportSchema,
  weeklyReportReviewSchema,
} from "@/lib/validation/reports";

const START_DRAFT_ERROR_PATH = "/reports?error=unable-to-start-draft";
const UPDATE_DRAFT_ERROR_PATH = "/reports?error=unable-to-update-draft";
const SUBMIT_REPORT_ERROR_PATH = "/reports?error=unable-to-submit-report";
const UPDATE_ABSENTEES_ERROR_PATH = "/reports?error=unable-to-update-absentees";
const ABSENTEE_MISSING_MEMBER_ERROR_PATH = "/reports?error=missing-absent-member";
const ABSENTEE_INVALID_DATE_ERROR_PATH = "/reports?error=invalid-absence-date";
const ABSENTEE_INACTIVE_DRAFT_ERROR_PATH = "/reports?error=report-no-longer-editable";
const ABSENTEE_DUPLICATE_ERROR_PATH = "/reports?error=duplicate-absentee";
const REVIEW_REPORT_ERROR_PATH = "/reports?error=unable-to-review-report";

type AssignedCompanyRow = {
  id: string;
};

type ExistingReportRow = {
  id: string;
};

type ActiveCompanyMemberRow = {
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

type ReviewableReportRow = {
  id: string;
  company_id: string;
  church_id: string;
  status: string;
};

function canStartReportDraft(role: string | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function canUpdateReportDraft(role: string | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function canSubmitReport(role: string | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function canUpdateAbsentees(role: string | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function canReviewReport(role: string | null) {
  return role === "church_admin" || role === "super_admin";
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

function getComputedAttendanceCounts(
  totalMembers: number,
  absenteeRecordCount: number,
) {
  const absentCount = Math.max(0, absenteeRecordCount);

  return {
    absentCount,
    presentCount: Math.max(0, totalMembers - absentCount),
  };
}

function isServiceDateInReportWeek(
  value: string,
  reportWeekStart: string,
  reportWeekEnd: string,
) {
  if (value < reportWeekStart || value > reportWeekEnd) {
    return false;
  }

  const day = new Date(`${value}T00:00:00.000Z`).getUTCDay();

  return day === 0 || day === 3 || day === 5;
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

  const [
    { data: report, error: reportError },
    { count, error: countError },
    { count: absenteeRecordCount, error: absenteeRecordCountError },
  ] = await Promise.all([
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
      supabase
        .from("absentee_records")
        .select("id", { count: "exact", head: true })
        .eq("church_id", churchId)
        .eq("company_id", company.id)
        .eq("weekly_report_id", reportId),
    ]);

  if (reportError || !report) {
    redirect(ABSENTEE_INACTIVE_DRAFT_ERROR_PATH);
  }

  if (countError || absenteeRecordCountError) {
    redirect(UPDATE_DRAFT_ERROR_PATH);
  }

  const totalMembers = count ?? 0;
  const attendanceCounts = getComputedAttendanceCounts(
    totalMembers,
    absenteeRecordCount ?? 0,
  );
  const validation = draftWeeklyReportUpdateBaseSchema.safeParse({
    reportId,
    companyId,
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
      present_count: attendanceCounts.presentCount,
      absent_count: attendanceCounts.absentCount,
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

export async function submitWeeklyReport(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canSubmitReport(primaryRole) || !churchId) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  const supabase = await createClient();
  const { reportWeekStart, reportWeekEnd } = getCurrentReportWeek();
  const reportId = getFormString(formData, "reportId");
  const companyId = getFormString(formData, "companyId");

  if (!isUuid(reportId) || !isUuid(companyId)) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
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
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  const [
    { data: report, error: reportError },
    { count, error: countError },
    { count: absenteeRecordCount, error: absenteeRecordCountError },
  ] = await Promise.all([
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
    supabase
      .from("absentee_records")
      .select("id", { count: "exact", head: true })
      .eq("church_id", churchId)
      .eq("company_id", company.id)
      .eq("weekly_report_id", reportId),
  ]);

  if (reportError || !report) {
    redirect(ABSENTEE_INACTIVE_DRAFT_ERROR_PATH);
  }

  if (countError || absenteeRecordCountError) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  const totalMembers = count ?? 0;
  const attendanceCounts = getComputedAttendanceCounts(
    totalMembers,
    absenteeRecordCount ?? 0,
  );
  const draftValidation = draftWeeklyReportUpdateBaseSchema.safeParse({
    reportId,
    companyId,
    newVisitorsCount: formData.get("newVisitorsCount"),
    generalNotes: formData.get("generalNotes"),
    supportNeeded: formData.get("supportNeeded"),
    testimonies: formData.get("testimonies"),
  });

  const submitValidation = submitWeeklyReportSchema.safeParse({
    reportId,
    companyId,
    newVisitorsCount: formData.get("newVisitorsCount"),
    generalNotes: formData.get("generalNotes"),
    supportNeeded: formData.get("supportNeeded"),
    testimonies: formData.get("testimonies"),
  });

  if (!draftValidation.success || !submitValidation.success) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  const values = draftValidation.data;

  if (
    values.companyId !== company.id ||
    values.reportId !== report.id ||
    report.company_id !== company.id ||
    report.church_id !== churchId ||
    report.status !== "draft" ||
    report.report_week_start !== reportWeekStart ||
    report.report_week_end !== reportWeekEnd ||
    attendanceCounts.presentCount + attendanceCounts.absentCount !== totalMembers
  ) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  const { error: draftUpdateError } = await supabase
    .from("weekly_reports")
    .update({
      total_members: totalMembers,
      present_count: attendanceCounts.presentCount,
      absent_count: attendanceCounts.absentCount,
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

  if (draftUpdateError) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  const { error: submitUpdateError } = await supabase
    .from("weekly_reports")
    .update({
      status: "submitted",
      submitted_by: user.id,
      submitted_at: new Date().toISOString(),
    })
    .eq("church_id", churchId)
    .eq("company_id", company.id)
    .eq("id", report.id)
    .eq("report_week_start", reportWeekStart)
    .eq("report_week_end", reportWeekEnd)
    .eq("status", "draft")
    .select("id")
    .single();

  if (submitUpdateError) {
    redirect(SUBMIT_REPORT_ERROR_PATH);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports?submitted=report");
}

export async function reviewWeeklyReport(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canReviewReport(primaryRole) || !churchId) {
    redirect(REVIEW_REPORT_ERROR_PATH);
  }

  const validation = weeklyReportReviewSchema.safeParse({
    reportId: formData.get("reportId"),
    reviewStatus: formData.get("reviewStatus"),
    reviewerNotes: formData.get("reviewerNotes"),
  });

  if (!validation.success) {
    redirect(REVIEW_REPORT_ERROR_PATH);
  }

  const values = validation.data;
  const supabase = await createClient();

  const { data: report, error: reportError } = await supabase
    .from("weekly_reports")
    .select("id, company_id, church_id, status")
    .eq("church_id", churchId)
    .eq("id", values.reportId)
    .eq("status", "submitted")
    .maybeSingle<ReviewableReportRow>();

  if (
    reportError ||
    !report ||
    report.church_id !== churchId ||
    report.status !== "submitted"
  ) {
    redirect(REVIEW_REPORT_ERROR_PATH);
  }

  const { error: updateError } = await supabase
    .from("weekly_reports")
    .update({
      status: values.reviewStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      reviewer_notes: values.reviewerNotes ?? null,
    })
    .eq("church_id", churchId)
    .eq("company_id", report.company_id)
    .eq("id", report.id)
    .eq("status", "submitted")
    .select("id")
    .single();

  if (updateError) {
    redirect(REVIEW_REPORT_ERROR_PATH);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports?reviewed=report");
}

export async function addAbsenteeRecord(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canUpdateAbsentees(primaryRole) || !churchId) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  const companyMemberId = getFormString(formData, "companyMemberId");
  const absenceDate = getFormString(formData, "absenceDate");

  if (!isUuid(companyMemberId)) {
    redirect(ABSENTEE_MISSING_MEMBER_ERROR_PATH);
  }

  const validation = absenteeRecordCreateSchema.safeParse({
    reportId: formData.get("reportId"),
    companyId: formData.get("companyId"),
    companyMemberId,
    absenceDate,
    reason: formData.get("reason"),
    reasonNote: formData.get("reasonNote"),
  });

  if (!validation.success) {
    redirect(ABSENTEE_INVALID_DATE_ERROR_PATH);
  }

  const values = validation.data;
  const supabase = await createClient();
  const { reportWeekStart, reportWeekEnd } = getCurrentReportWeek();

  if (!isServiceDateInReportWeek(values.absenceDate, reportWeekStart, reportWeekEnd)) {
    redirect(ABSENTEE_INVALID_DATE_ERROR_PATH);
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("church_id", churchId)
    .eq("id", values.companyId)
    .or(`leader_id.eq.${user.id},assistant_leader_id.eq.${user.id}`)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<AssignedCompanyRow>();

  if (companyError || !company) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  const [
    { data: report, error: reportError },
    { data: companyMember, error: companyMemberError },
    { data: duplicateAbsenteeRecord, error: duplicateAbsenteeRecordError },
  ] = await Promise.all([
    supabase
      .from("weekly_reports")
      .select("id, company_id, church_id, report_week_start, report_week_end, status")
      .eq("church_id", churchId)
      .eq("company_id", company.id)
      .eq("id", values.reportId)
      .eq("report_week_start", reportWeekStart)
      .eq("report_week_end", reportWeekEnd)
      .eq("status", "draft")
      .maybeSingle<DraftReportRow>(),
    supabase
      .from("company_members")
      .select("id")
      .eq("church_id", churchId)
      .eq("company_id", company.id)
      .eq("id", values.companyMemberId)
      .eq("status", "active")
      .maybeSingle<ActiveCompanyMemberRow>(),
    supabase
      .from("absentee_records")
      .select("id")
      .eq("church_id", churchId)
      .eq("company_id", company.id)
      .eq("weekly_report_id", values.reportId)
      .eq("company_member_id", values.companyMemberId)
      .maybeSingle<{ id: string }>(),
  ]);

  if (reportError || !report) {
    redirect(ABSENTEE_INACTIVE_DRAFT_ERROR_PATH);
  }

  if (companyMemberError || !companyMember) {
    redirect(ABSENTEE_MISSING_MEMBER_ERROR_PATH);
  }

  if (duplicateAbsenteeRecordError) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  if (duplicateAbsenteeRecord) {
    redirect(ABSENTEE_DUPLICATE_ERROR_PATH);
  }

  const { error: insertError } = await supabase.from("absentee_records").insert({
    church_id: churchId,
    weekly_report_id: report.id,
    company_id: company.id,
    company_member_id: companyMember.id,
    absence_date: values.absenceDate,
    reason: values.reason,
    reason_note: values.reasonNote ?? null,
    streak_count: 1,
    follow_up_required: false,
  });

  if (insertError?.code === "23505") {
    redirect(ABSENTEE_DUPLICATE_ERROR_PATH);
  }

  if (insertError?.code === "23503") {
    const details = `${insertError.details ?? ""} ${insertError.message ?? ""}`;

    if (details.includes("company_member_id")) {
      redirect(ABSENTEE_MISSING_MEMBER_ERROR_PATH);
    }

    if (details.includes("weekly_report_id")) {
      redirect(ABSENTEE_INACTIVE_DRAFT_ERROR_PATH);
    }
  }

  if (insertError?.code === "23514") {
    redirect(ABSENTEE_INVALID_DATE_ERROR_PATH);
  }

  if (insertError?.code === "42501") {
    redirect(ABSENTEE_INACTIVE_DRAFT_ERROR_PATH);
  }

  if (insertError) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports?updated=absentees");
}

export async function removeAbsenteeRecord(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canUpdateAbsentees(primaryRole) || !churchId) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  const validation = absenteeRecordRemoveSchema.safeParse({
    reportId: formData.get("reportId"),
    companyId: formData.get("companyId"),
    absenteeRecordId: formData.get("absenteeRecordId"),
  });

  if (!validation.success) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  const values = validation.data;
  const supabase = await createClient();
  const { reportWeekStart, reportWeekEnd } = getCurrentReportWeek();

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("church_id", churchId)
    .eq("id", values.companyId)
    .or(`leader_id.eq.${user.id},assistant_leader_id.eq.${user.id}`)
    .eq("status", "active")
    .limit(1)
    .maybeSingle<AssignedCompanyRow>();

  if (companyError || !company) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  const { data: report, error: reportError } = await supabase
    .from("weekly_reports")
    .select("id, company_id, church_id, report_week_start, report_week_end, status")
    .eq("church_id", churchId)
    .eq("company_id", company.id)
    .eq("id", values.reportId)
    .eq("report_week_start", reportWeekStart)
    .eq("report_week_end", reportWeekEnd)
    .eq("status", "draft")
    .maybeSingle<DraftReportRow>();

  if (reportError || !report) {
    redirect(ABSENTEE_INACTIVE_DRAFT_ERROR_PATH);
  }

  const { error: deleteError } = await supabase
    .from("absentee_records")
    .delete()
    .eq("church_id", churchId)
    .eq("company_id", company.id)
    .eq("weekly_report_id", report.id)
    .eq("id", values.absenteeRecordId)
    .select("id")
    .single();

  if (deleteError) {
    redirect(UPDATE_ABSENTEES_ERROR_PATH);
  }

  revalidatePath("/reports");
  revalidatePath("/dashboard");
  redirect("/reports?updated=absentees");
}
