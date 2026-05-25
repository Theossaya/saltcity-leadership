import { Check } from "@/components/v2/primitives/check";
import { Button } from "@/components/v2/primitives/button";
import { Field, Select } from "@/components/v2/primitives/field";
import { Pill } from "@/components/v2/primitives/pill";
import { updateTaskStatus } from "@/features/tasks/actions";
import type { TaskListItem, TaskPriority, TaskStatus } from "@/features/tasks/queries";
import {
  FOLLOW_UP_STATUS_LABELS,
  TASK_STATUSES,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskListItem;
};

const taskStatusTone: Record<TaskStatus, "urgent" | "care" | "ok" | "quiet"> = {
  todo: "quiet",
  in_progress: "care",
  blocked: "urgent",
  done: "ok",
};

const taskPriorityTone: Record<TaskPriority, string> = {
  low: "text-ink-3",
  normal: "text-ink-3",
  high: "text-urgent",
  urgent: "text-urgent",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T00:00:00+01:00`));
}

function getFollowUpStatusLabel(status: string) {
  return (
    FOLLOW_UP_STATUS_LABELS[status as keyof typeof FOLLOW_UP_STATUS_LABELS] ??
    "Linked follow-up"
  );
}

export function TaskCard({ task }: TaskCardProps) {
  const priorityLabel = task.priority ? TASK_PRIORITY_LABELS[task.priority] : null;
  const followUpLabel = task.followUpCaseId
    ? task.followUpCaseStatus
      ? getFollowUpStatusLabel(task.followUpCaseStatus)
      : "Follow-up linked"
    : null;
  const metaItems = [
    task.companyName ?? "Leadership task",
    task.dueDate ? `Due ${formatDate(task.dueDate)}` : "No due date",
    task.assignedUserName ? `For ${task.assignedUserName}` : "Unassigned",
    followUpLabel,
  ].filter(Boolean);
  const showStatusPill = task.status === "in_progress" || task.status === "blocked";

  return (
    <article className="py-[13px] first:pt-0 last:pb-0 [&+&]:shadow-[inset_0_1px_0_var(--rule)]">
      <div className="flex gap-3.5">
        <Check done={task.status === "done"} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={cn(
                  "break-words font-sans text-sm font-medium leading-[1.35] tracking-[-0.005em]",
                  task.status === "done"
                    ? "text-ink-3 line-through"
                    : "text-ink",
                )}
              >
                {task.title}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-[11.5px] font-medium leading-[1.4] text-ink-3">
                {metaItems.map((item, index) => (
                  <span key={`${task.id}-${item}`} className="contents">
                    {index > 0 ? <span className="opacity-50">·</span> : null}
                    <span className="break-words">{item}</span>
                  </span>
                ))}
                {priorityLabel ? (
                  <>
                    <span className="opacity-50">·</span>
                    <span
                      className={cn(
                        "font-mono text-[9px] font-bold uppercase tracking-[0.12em]",
                        taskPriorityTone[task.priority ?? "normal"],
                      )}
                    >
                      {priorityLabel}
                    </span>
                  </>
                ) : null}
                <span className="opacity-50">·</span>
                <span>{task.status === "done" ? "Closed" : TASK_STATUS_LABELS[task.status]}</span>
              </p>
            </div>
            {showStatusPill ? (
              <Pill tone={taskStatusTone[task.status]} className="mt-0.5 shrink-0">
                {TASK_STATUS_LABELS[task.status]}
              </Pill>
            ) : null}
          </div>

          {task.description ? (
            <p
              className={cn(
                "mt-2 whitespace-pre-wrap break-words font-sans text-[12.5px] leading-[1.5]",
                task.status === "done" ? "text-ink-3" : "text-ink-2",
              )}
            >
              {task.description}
            </p>
          ) : null}

          {task.canUpdateStatus ? (
            <details className="group mt-3 rounded-input bg-bg shadow-[inset_0_0_0_1px_var(--rule)]">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 font-sans text-[12.5px] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span>Update progress</span>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3 group-open:hidden">
                  {TASK_STATUS_LABELS[task.status]}
                </span>
                <span className="hidden font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3 group-open:inline">
                  Choose status
                </span>
              </summary>
              <form
                action={updateTaskStatus}
                className="grid gap-3 px-3 pb-3 sm:grid-cols-[1fr_auto] sm:items-end"
              >
                <input type="hidden" name="taskId" value={task.id} />
                <Field htmlFor={`task-status-${task.id}`} label="Status">
                  <Select
                    id={`task-status-${task.id}`}
                    name="status"
                    defaultValue={task.status}
                  >
                    {TASK_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {TASK_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button type="submit" className="w-full sm:w-auto">
                  Save status
                </Button>
              </form>
            </details>
          ) : null}
        </div>
      </div>
    </article>
  );
}
