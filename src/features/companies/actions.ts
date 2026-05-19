"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/get-current-user";
import { createClient } from "@/lib/supabase/server";
import { companyMemberCreateSchema } from "@/lib/validation/company-members";

const CREATE_MEMBER_ERROR_PATH = "/companies?error=unable-to-create-member";

function canCreateCompanyMember(role: string | null) {
  return role === "church_admin" || role === "super_admin";
}

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createCompanyMember(formData: FormData) {
  const { user, primaryRole, churchId } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!canCreateCompanyMember(primaryRole) || !churchId) {
    redirect(CREATE_MEMBER_ERROR_PATH);
  }

  const parsed = companyMemberCreateSchema.safeParse({
    companyId: getFormString(formData, "companyId"),
    fullName: getFormString(formData, "fullName"),
    phone: getFormString(formData, "phone"),
    email: getFormString(formData, "email"),
  });

  if (!parsed.success) {
    redirect(CREATE_MEMBER_ERROR_PATH);
  }

  const supabase = await createClient();
  const { data } = parsed;
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, status")
    .eq("id", data.companyId)
    .eq("church_id", churchId)
    .eq("status", "active")
    .maybeSingle<{ id: string; status: "active" | "inactive" }>();

  if (companyError || !company) {
    redirect(CREATE_MEMBER_ERROR_PATH);
  }

  const { error } = await supabase.from("company_members").insert({
    church_id: churchId,
    company_id: data.companyId,
    full_name: data.fullName,
    phone: data.phone ?? null,
    email: data.email ?? null,
    status: "active",
  });

  if (error) {
    redirect(CREATE_MEMBER_ERROR_PATH);
  }

  revalidatePath("/companies");
  revalidatePath("/reports");
  redirect("/companies?created=member");
}
