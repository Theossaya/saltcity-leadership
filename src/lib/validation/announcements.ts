import { z } from "zod";

export const ANNOUNCEMENT_AUDIENCE_TYPES = [
  "all_leaders",
  "company",
  "unit",
  "role",
] as const;

export const ANNOUNCEMENT_AUDIENCE_ROLES = [
  "super_admin",
  "church_admin",
  "company_leader",
  "assistant_leader",
  "unit_leader",
  "general_leader",
] as const;

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().uuid().optional(),
);

const optionalRole = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.enum(ANNOUNCEMENT_AUDIENCE_ROLES).optional(),
);

const optionalExpiry = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Expiry must be a valid date and time.",
    })
    .refine((value) => new Date(value) > new Date(), {
      message: "Expiry must be in the future.",
    })
    .optional(),
);

export const announcementCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    message: z.string().trim().min(1).max(3000),
    audienceType: z.enum(ANNOUNCEMENT_AUDIENCE_TYPES),
    audienceRole: optionalRole,
    audienceCompanyId: optionalUuid,
    audienceUnitId: optionalUuid,
    isUrgent: z.coerce.boolean().default(false),
    expiresAt: optionalExpiry,
  })
  .superRefine((value, context) => {
    if (
      value.audienceType === "all_leaders" &&
      (value.audienceRole || value.audienceCompanyId || value.audienceUnitId)
    ) {
      context.addIssue({
        code: "custom",
        message: "All-leader announcements cannot include a specific target.",
        path: ["audienceType"],
      });
    }

    if (value.audienceType === "role" && !value.audienceRole) {
      context.addIssue({
        code: "custom",
        message: "Role announcements require an audience role.",
        path: ["audienceRole"],
      });
    }

    if (value.audienceType === "company" && !value.audienceCompanyId) {
      context.addIssue({
        code: "custom",
        message: "Company announcements require an audience company.",
        path: ["audienceCompanyId"],
      });
    }

    if (value.audienceType === "unit" && !value.audienceUnitId) {
      context.addIssue({
        code: "custom",
        message: "Unit announcements require an audience unit.",
        path: ["audienceUnitId"],
      });
    }
  });

export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>;
