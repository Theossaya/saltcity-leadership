import { z } from "zod";

export const TASK_CREATE_PRIORITIES = [
  "low",
  "normal",
  "high",
  "urgent",
] as const;

export const TASK_CREATE_LINKED_ENTITY_TYPES = ["company"] as const;

function formatDateInLagos(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getTaskCreateMinimumDueDate() {
  const lagosToday = formatDateInLagos(new Date());
  const minimum = new Date(`${lagosToday}T00:00:00Z`);

  minimum.setUTCDate(minimum.getUTCDate() - 30);

  return minimum.toISOString().slice(0, 10);
}

function isValidDateString(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
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

const optionalDueDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(isValidDateString, "Due date must be a valid date.")
    .refine((value) => {
      return value >= getTaskCreateMinimumDueDate();
    }, "Due date cannot be more than 30 days in the past.")
    .optional(),
);

const optionalLinkedEntityType = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.enum(TASK_CREATE_LINKED_ENTITY_TYPES).optional(),
);

export const taskCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: optionalText(2000),
    assignedTo: optionalUuid,
    dueDate: optionalDueDate,
    priority: z.enum(TASK_CREATE_PRIORITIES).default("normal"),
    linkedEntityType: optionalLinkedEntityType,
    linkedEntityId: optionalUuid,
    followUpCaseId: optionalUuid,
  })
  .superRefine((value, context) => {
    if (value.linkedEntityType && !value.linkedEntityId) {
      context.addIssue({
        code: "custom",
        message: "Linked entity id is required when a linked entity type is set.",
        path: ["linkedEntityId"],
      });
    }

    if (!value.linkedEntityType && value.linkedEntityId) {
      context.addIssue({
        code: "custom",
        message: "Linked entity type is required when a linked entity id is set.",
        path: ["linkedEntityType"],
      });
    }
  });

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
