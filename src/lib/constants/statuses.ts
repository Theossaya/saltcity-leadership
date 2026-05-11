export const REPORT_STATUSES = [
  "not_started",
  "draft",
  "submitted",
  "reviewed",
  "flagged",
] as const;

export const REPORT_STATUS_LABELS = {
  not_started: "Not started",
  draft: "Draft",
  submitted: "Submitted",
  reviewed: "Reviewed",
  flagged: "Flagged",
} as const;

export const ABSENCE_REASONS = [
  "no_reason_given",
  "illness",
  "travel",
  "work",
  "school",
  "family_issue",
  "bereavement",
  "other",
] as const;

export const ABSENCE_REASON_LABELS = {
  no_reason_given: "No reason given",
  illness: "Illness",
  travel: "Travel",
  work: "Work",
  school: "School",
  family_issue: "Family issue",
  bereavement: "Bereavement",
  other: "Other",
} as const;

export const FOLLOW_UP_STATUSES = [
  "open",
  "assigned",
  "contacted",
  "resolved",
  "escalated",
] as const;

export const FOLLOW_UP_STATUS_LABELS = {
  open: "Open",
  assigned: "Assigned",
  contacted: "Contacted",
  resolved: "Resolved",
  escalated: "Escalated",
} as const;

export const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"] as const;

export const TASK_STATUS_LABELS = {
  todo: "To do",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
} as const;

export const TASK_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export const TASK_PRIORITY_LABELS = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
} as const;
