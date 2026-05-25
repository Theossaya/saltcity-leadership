"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import {
  followUpCaseCreateSchema,
  followUpCaseProgressUpdateSchema,
} from "@/lib/validation/follow-up";

const UPDATE_FOLLOW_UP_CASE_ERROR_PATH =
  "/follow-up?error=unable-to-update-case";

type CreateFollowUpCaseError =
  | "duplicate-case"
  | "invalid-absentee"
  | "invalid-assignee"
  | "permission-denied"
  | "unable-to-create-case";

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

type SupabaseWriteError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

function getCreateFollowUpCaseErrorPath(error: CreateFollowUpCaseError) {
  return `/follow-up?error=${error}`;
}

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

function logFollowUpCaseCreateInsertFailure({
  error,
  absenteeRecordId,
  companyId,
  companyMemberId,
  assignedTo,
  priority,
}: {
  error: SupabaseWriteError;
  absenteeRecordId: string;
  companyId: string | null;
  companyMemberId: string | null;
  assignedTo: string | null | undefined;
  priority: string;
}) {
  console.error("follow_up_case_create_insert_failed", {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    context: {
      absenteeRecordId,
      companyId,
      companyMemberId,
      hasAssignedTo: Boolean(assignedTo),
      priority,
    },
  });
}

export async function createFollowUpCase(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canCreateFollowUpCase(primaryRole) || !churchId) {
    redirect(getCreateFollowUpCaseErrorPath("permission-denied"));
  }

  const parsed = followUpCaseCreateSchema.safeParse({
    absenteeRecordId: getFormString(formData, "absenteeRecordId"),
    assignedTo: getFormString(formData, "assignedTo"),
    priority: getFormString(formData, "priority") || "normal",
    nextAction: getFormString(formData, "nextAction"),
    notes: getFormString(formData, "notes"),
  });

  if (!parsed.success) {
    redirect(getCreateFollowUpCaseErrorPath("unable-to-create-case"));
  }

  const supabase = await createClient();

  if (parsed.data.assignedTo) {
    const { data: assigneeMembership, error: assigneeMembershipError } =
      await supabase
        .from("church_memberships")
        .select("user_id")
        .eq("church_id", churchId)
        .eq("user_id", parsed.data.assignedTo)
        .eq("status", "active")
        .limit(1)
        .maybeSingle<{ user_id: string }>();

    if (assigneeMembershipError || !assigneeMembership) {
      redirect(getCreateFollowUpCaseErrorPath("invalid-assignee"));
    }
  }

  const { data: absenteeRecord, error: absenteeRecordError } = await supabase
    .from("absentee_records")
    .select("id, church_id, company_id, company_member_id")
    .eq("id", parsed.data.absenteeRecordId)
    .eq("church_id", churchId)
    .maybeSingle<AbsenteeRecordRow>();

  if (absenteeRecordError || !absenteeRecord) {
    redirect(getCreateFollowUpCaseErrorPath("invalid-absentee"));
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
    redirect(
      getCreateFollowUpCaseErrorPath(
        existingCase ? "duplicate-case" : "unable-to-create-case",
      ),
    );
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
    logFollowUpCaseCreateInsertFailure({
      error,
      absenteeRecordId: absenteeRecord.id,
      companyId: absenteeRecord.company_id,
      companyMemberId: absenteeRecord.company_member_id,
      assignedTo: parsed.data.assignedTo,
      priority: parsed.data.priority,
    });

    if (error.code === "23505") {
      redirect(getCreateFollowUpCaseErrorPath("duplicate-case"));
    }

    if (error.code === "23503") {
      redirect(getCreateFollowUpCaseErrorPath("invalid-assignee"));
    }

    if (error.code === "42501") {
      redirect(getCreateFollowUpCaseErrorPath("permission-denied"));
    }

    redirect(getCreateFollowUpCaseErrorPath("unable-to-create-case"));
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
