import { z } from "zod";

import { TASK_PRIORITIES } from "@/lib/constants/statuses";

export const FOLLOW_UP_CASE_PRIORITIES = TASK_PRIORITIES;

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
