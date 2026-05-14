import { z } from "zod";

const optionalReportText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(1500).optional(),
);

export const draftWeeklyReportUpdateBaseSchema = z.object({
  reportId: z.string().uuid(),
  companyId: z.string().uuid(),
  presentCount: z.coerce.number().int().min(0),
  absentCount: z.coerce.number().int().min(0),
  newVisitorsCount: z.coerce.number().int().min(0),
  generalNotes: optionalReportText,
  supportNeeded: optionalReportText,
  testimonies: optionalReportText,
});

export function createDraftWeeklyReportUpdateSchema(totalMembers: number) {
  return draftWeeklyReportUpdateBaseSchema.refine(
    (value) => value.presentCount + value.absentCount <= totalMembers,
    {
      message: "Present and absent counts cannot exceed total members.",
      path: ["absentCount"],
    },
  );
}

export type DraftWeeklyReportUpdateInput = z.infer<
  typeof draftWeeklyReportUpdateBaseSchema
>;

export const submitWeeklyReportSchema = draftWeeklyReportUpdateBaseSchema;

export type SubmitWeeklyReportInput = z.infer<typeof submitWeeklyReportSchema>;
