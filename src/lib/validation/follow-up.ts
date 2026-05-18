import { z } from "zod";

import { FOLLOW_UP_STATUSES, TASK_PRIORITIES } from "@/lib/constants/statuses";

export const FOLLOW_UP_CASE_PRIORITIES = TASK_PRIORITIES;

function isValidDateString(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function getTodayDateInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const optionalUuid = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().uuid().optional(),
);

const optionalText = (max: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z.string().trim().max(max).optional(),
  );

const optionalContactDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isValidDateString, "Date contacted must be a valid date.")
    .refine(
      (value) => value <= getTodayDateInput(),
      "Date contacted cannot be in the future.",
    )
    .optional(),
);

export const followUpCaseCreateSchema = z.object({
  absenteeRecordId: z.string().uuid(),
  assignedTo: optionalUuid,
  priority: z.enum(FOLLOW_UP_CASE_PRIORITIES).default("normal"),
  nextAction: optionalText(500),
  notes: optionalText(2000),
});

export type FollowUpCaseCreateInput = z.infer<
  typeof followUpCaseCreateSchema
>;

export const followUpCaseProgressUpdateSchema = z.object({
  followUpCaseId: z.string().uuid(),
  status: z.enum(FOLLOW_UP_STATUSES),
  dateContacted: optionalContactDate,
  nextAction: optionalText(500),
  notes: optionalText(2000),
});

export type FollowUpCaseProgressUpdateInput = z.infer<
  typeof followUpCaseProgressUpdateSchema
>;
