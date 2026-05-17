"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { followUpCaseCreateSchema } from "@/lib/validation/follow-up";

const CREATE_FOLLOW_UP_CASE_ERROR_PATH =
  "/follow-up?error=unable-to-create-case";

type AbsenteeRecordRow = {
  id: string;
  church_id: string;
  company_id: string;
  company_member_id: string;
};

function canCreateFollowUpCase(role: string | null) {
  return role === "church_admin" || role === "super_admin";
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createFollowUpCase(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canCreateFollowUpCase(primaryRole) || !churchId) {
    redirect(CREATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const parsed = followUpCaseCreateSchema.safeParse({
    absenteeRecordId: getFormString(formData, "absenteeRecordId"),
    assignedTo: getFormString(formData, "assignedTo"),
    priority: getFormString(formData, "priority") || "normal",
    nextAction: getFormString(formData, "nextAction"),
    notes: getFormString(formData, "notes"),
  });

  if (!parsed.success) {
    redirect(CREATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const supabase = await createClient();
  const { data: absenteeRecord, error: absenteeRecordError } = await supabase
    .from("absentee_records")
    .select("id, church_id, company_id, company_member_id")
    .eq("id", parsed.data.absenteeRecordId)
    .eq("church_id", churchId)
    .maybeSingle<AbsenteeRecordRow>();

  if (absenteeRecordError || !absenteeRecord) {
    redirect(CREATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const { data: existingCase, error: existingCaseError } = await supabase
    .from("follow_up_cases")
    .select("id")
    .eq("church_id", churchId)
    .eq("absentee_record_id", absenteeRecord.id)
    .in("status", ["open", "assigned", "contacted", "escalated"])
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existingCaseError || existingCase) {
    redirect(CREATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const { error } = await supabase.from("follow_up_cases").insert({
    church_id: churchId,
    company_id: absenteeRecord.company_id,
    company_member_id: absenteeRecord.company_member_id,
    absentee_record_id: absenteeRecord.id,
    assigned_to: parsed.data.assignedTo ?? null,
    priority: parsed.data.priority,
    status: parsed.data.assignedTo ? "assigned" : "open",
    next_action: parsed.data.nextAction ?? null,
    notes: parsed.data.notes ?? null,
    date_contacted: null,
    resolved_at: null,
  });

  if (error) {
    redirect(CREATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  revalidatePath("/follow-up");
  revalidatePath("/dashboard");
  redirect("/follow-up?created=case");
}
