"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { announcementCreateSchema } from "@/lib/validation/announcements";

const CREATE_ANNOUNCEMENT_ERROR_PATH =
  "/announcements?error=unable-to-create-announcement";

function canCreateAnnouncement(role: string | null) {
  return role === "church_admin" || role === "super_admin";
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createAnnouncement(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canCreateAnnouncement(primaryRole) || !churchId) {
    redirect(CREATE_ANNOUNCEMENT_ERROR_PATH);
  }

  const audienceType = getFormString(formData, "audienceType");
  const parsed = announcementCreateSchema.safeParse({
    title: getFormString(formData, "title"),
    message: getFormString(formData, "message"),
    audienceType,
    audienceRole:
      audienceType === "role" ? getFormString(formData, "audienceRole") : "",
    audienceCompanyId:
      audienceType === "company"
        ? getFormString(formData, "audienceCompanyId")
        : "",
    audienceUnitId:
      audienceType === "unit" ? getFormString(formData, "audienceUnitId") : "",
    isUrgent: formData.get("isUrgent") === "on",
    expiresAt: getFormString(formData, "expiresAt"),
  });

  if (!parsed.success) {
    redirect(CREATE_ANNOUNCEMENT_ERROR_PATH);
  }

  const supabase = await createClient();
  const { data } = parsed;
  const { error } = await supabase.from("announcements").insert({
    church_id: churchId,
    title: data.title,
    message: data.message,
    audience_type: data.audienceType,
    audience_role: data.audienceType === "role" ? data.audienceRole : null,
    audience_company_id:
      data.audienceType === "company" ? data.audienceCompanyId : null,
    audience_unit_id: data.audienceType === "unit" ? data.audienceUnitId : null,
    is_urgent: data.isUrgent,
    expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
    created_by: user.id,
  });

  if (error) {
    redirect(CREATE_ANNOUNCEMENT_ERROR_PATH);
  }

  revalidatePath("/announcements");
  revalidatePath("/dashboard");
  redirect("/announcements?created=announcement");
}
