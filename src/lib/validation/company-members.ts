import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().max(max).optional(),
  );

const optionalEmail = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().email().max(254).optional(),
);

export const companyMemberCreateSchema = z.object({
  companyId: z.string().uuid(),
  fullName: z.string().trim().min(1).max(160),
  phone: optionalText(40),
  email: optionalEmail,
});

export type CompanyMemberCreateInput = z.infer<
  typeof companyMemberCreateSchema
>;
