import { z } from "zod";

const optionalReportText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(1500).optional(),
);

export const draftWeeklyReportUpdateBaseSchema = z.object({
  reportId: z.string().uuid(),
  companyId: z.string().uuid(),
  newVisitorsCount: z.coerce.number().int().min(0),
  generalNotes: optionalReportText,
  supportNeeded: optionalReportText,
  testimonies: optionalReportText,
});

export type DraftWeeklyReportUpdateInput = z.infer<
  typeof draftWeeklyReportUpdateBaseSchema
>;

export const submitWeeklyReportSchema = draftWeeklyReportUpdateBaseSchema;

export type SubmitWeeklyReportInput = z.infer<typeof submitWeeklyReportSchema>;

const optionalReviewerNotes = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(1500).optional(),
);

export const weeklyReportReviewSchema = z
  .object({
    reportId: z.string().uuid(),
    reviewStatus: z.enum(["reviewed", "flagged"]),
    reviewerNotes: optionalReviewerNotes,
  })
  .refine(
    (value) =>
      value.reviewStatus !== "flagged" ||
      Boolean(value.reviewerNotes && value.reviewerNotes.length > 0),
    {
      message: "Reviewer notes are required when flagging a report.",
      path: ["reviewerNotes"],
    },
  );

export type WeeklyReportReviewInput = z.infer<typeof weeklyReportReviewSchema>;
