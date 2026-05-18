"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import {
  followUpCaseCreateSchema,
  followUpCaseProgressUpdateSchema,
} from "@/lib/validation/follow-up";

const CREATE_FOLLOW_UP_CASE_ERROR_PATH =
  "/follow-up?error=unable-to-create-case";
const UPDATE_FOLLOW_UP_CASE_ERROR_PATH =
  "/follow-up?error=unable-to-update-case";

type AbsenteeRecordRow = {
  id: string;
  church_id: string;
  company_id: string;
  company_member_id: string;
};

type FollowUpCaseRow = {
  id: string;
  church_id: string;
  assigned_to: string | null;
};

function canCreateFollowUpCase(role: string | null) {
  return role === "church_admin" || role === "super_admin";
}

function canUpdateAnyFollowUpCase(role: string | null) {
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

export async function updateFollowUpCaseProgress(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!churchId) {
    redirect(UPDATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const parsed = followUpCaseProgressUpdateSchema.safeParse({
    followUpCaseId: getFormString(formData, "followUpCaseId"),
    status: getFormString(formData, "status"),
    dateContacted: getFormString(formData, "dateContacted"),
    nextAction: getFormString(formData, "nextAction"),
    notes: getFormString(formData, "notes"),
  });

  if (!parsed.success) {
    redirect(UPDATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const supabase = await createClient();
  const { data: followUpCase, error: followUpCaseError } = await supabase
    .from("follow_up_cases")
    .select("id, church_id, assigned_to")
    .eq("id", parsed.data.followUpCaseId)
    .eq("church_id", churchId)
    .maybeSingle<FollowUpCaseRow>();

  if (followUpCaseError || !followUpCase) {
    redirect(UPDATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const canUpdate =
    canUpdateAnyFollowUpCase(primaryRole) || followUpCase.assigned_to === user.id;

  if (!canUpdate) {
    redirect(UPDATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  if (parsed.data.status === "assigned" && !followUpCase.assigned_to) {
    redirect(UPDATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  const resolvedAt =
    parsed.data.status === "resolved" ? new Date().toISOString() : null;

  const { error } = await supabase
    .from("follow_up_cases")
    .update({
      status: parsed.data.status,
      date_contacted: parsed.data.dateContacted ?? null,
      next_action: parsed.data.nextAction ?? null,
      notes: parsed.data.notes ?? null,
      resolved_at: resolvedAt,
    })
    .eq("id", followUpCase.id)
    .eq("church_id", churchId);

  if (error) {
    redirect(UPDATE_FOLLOW_UP_CASE_ERROR_PATH);
  }

  revalidatePath("/follow-up");
  revalidatePath("/dashboard");
  redirect("/follow-up?updated=case");
}
