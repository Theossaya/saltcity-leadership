import { z } from "zod";

import { ABSENCE_REASONS } from "@/lib/constants/statuses";

const optionalAbsenteeText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(1000).optional(),
);

export const absenteeRecordCreateSchema = z.object({
  reportId: z.string().uuid(),
  companyId: z.string().uuid(),
  companyMemberId: z.string().uuid(),
  absenceDate: z.string().date(),
  reason: z.enum(ABSENCE_REASONS),
  reasonNote: optionalAbsenteeText,
});

export const absenteeRecordRemoveSchema = z.object({
  reportId: z.string().uuid(),
  companyId: z.string().uuid(),
  absenteeRecordId: z.string().uuid(),
});

export type AbsenteeRecordCreateInput = z.infer<
  typeof absenteeRecordCreateSchema
>;

export type AbsenteeRecordRemoveInput = z.infer<
  typeof absenteeRecordRemoveSchema
>;
