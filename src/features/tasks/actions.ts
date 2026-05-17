"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import {
  taskCreateSchema,
  taskStatusUpdateSchema,
} from "@/lib/validation/tasks";

const CREATE_TASK_ERROR_PATH = "/tasks?error=unable-to-create-task";
const UPDATE_TASK_STATUS_ERROR_PATH = "/tasks?error=unable-to-update-task";

function canCreateTask(role: string | null) {
  return role === "church_admin" || role === "super_admin";
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createTask(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canCreateTask(primaryRole) || !churchId) {
    redirect(CREATE_TASK_ERROR_PATH);
  }

  const linkedEntityId = getFormString(formData, "linkedEntityId");
  const parsed = taskCreateSchema.safeParse({
    title: getFormString(formData, "title"),
    description: getFormString(formData, "description"),
    assignedTo: getFormString(formData, "assignedTo"),
    dueDate: getFormString(formData, "dueDate"),
    priority: getFormString(formData, "priority") || "normal",
    linkedEntityType: linkedEntityId ? "company" : "",
    linkedEntityId,
    followUpCaseId: getFormString(formData, "followUpCaseId"),
  });

  if (!parsed.success) {
    redirect(CREATE_TASK_ERROR_PATH);
  }

  const { data } = parsed;
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    church_id: churchId,
    title: data.title,
    description: data.description ?? null,
    assigned_to: data.assignedTo ?? null,
    created_by: user.id,
    due_date: data.dueDate ?? null,
    priority: data.priority,
    status: "todo",
    follow_up_case_id: data.followUpCaseId ?? null,
    linked_entity_type: data.linkedEntityType ?? null,
    linked_entity_id: data.linkedEntityId ?? null,
  });

  if (error) {
    redirect(CREATE_TASK_ERROR_PATH);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks?created=task");
}

export async function updateTaskStatus(formData: FormData) {
  const { user, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!churchId) {
    redirect(UPDATE_TASK_STATUS_ERROR_PATH);
  }

  const parsed = taskStatusUpdateSchema.safeParse({
    taskId: getFormString(formData, "taskId"),
    status: getFormString(formData, "status"),
  });

  if (!parsed.success) {
    redirect(UPDATE_TASK_STATUS_ERROR_PATH);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.taskId)
    .eq("church_id", churchId)
    .eq("assigned_to", user.id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    redirect(UPDATE_TASK_STATUS_ERROR_PATH);
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks?updated=status");
}
