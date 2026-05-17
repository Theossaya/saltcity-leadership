import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const taskStatusClasses: Record<TaskStatus, string> = {
  todo: "border-[#CFC4D4] bg-[#F5F0F7] text-[#241126]",
  in_progress: "border-[#C5D1DE] bg-[#F0F4F8] text-[#102033]",
  blocked: "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]",
  done: "border-[#C9D8CF] bg-[#F1F7F3] text-[#1D4B31]",
};

const taskPriorityClasses: Record<TaskPriority, string> = {
  low: "border-border bg-white text-muted-foreground",
  normal: "border-[#C5D1DE] bg-[#F0F4F8] text-[#102033]",
  high: "border-[#D9C8B5] bg-[#F8F3EE] text-[#4B3323]",
  urgent: "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]",
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
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-[0_10px_28px_rgba(21,18,23,0.045)]">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {task.companyName ?? "Leadership task"}
            </p>
            <CardTitle className="mt-1 text-lg font-semibold">
              {task.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-6 rounded-4xl px-2.5 text-[0.7rem] font-semibold uppercase tracking-normal",
              taskStatusClasses[task.status],
            )}
          >
            {TASK_STATUS_LABELS[task.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 sm:grid-cols-3 sm:p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Assigned to
            </p>
            <p className="mt-1 font-medium text-foreground">
              {task.assignedUserName ?? "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Due date
            </p>
            <p className="mt-1 font-medium text-foreground">
              {task.dueDate ? formatDate(task.dueDate) : "No due date"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Updated
            </p>
            <p className="mt-1 font-medium text-foreground">
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeZone: "Africa/Lagos",
              }).format(new Date(task.updatedAt))}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {task.priority ? (
            <Badge
              variant="outline"
              className={cn("rounded-4xl", taskPriorityClasses[task.priority])}
            >
              {TASK_PRIORITY_LABELS[task.priority]}
            </Badge>
          ) : null}
          {task.companyName ? (
            <Badge variant="outline">{task.companyName}</Badge>
          ) : null}
          {task.followUpCaseId ? (
            <Badge variant="secondary">
              {task.followUpCaseStatus
                ? getFollowUpStatusLabel(task.followUpCaseStatus)
                : "Follow-up linked"}
            </Badge>
          ) : null}
        </div>

        {task.description ? (
          <p className="rounded-lg border border-border/80 bg-white px-4 py-3 text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        {task.canUpdateStatus ? (
          <form
            action={updateTaskStatus}
            className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 sm:grid-cols-[1fr_auto] sm:items-end"
          >
            <input type="hidden" name="taskId" value={task.id} />
            <div className="grid gap-2">
              <label
                htmlFor={`task-status-${task.id}`}
                className="text-xs font-semibold uppercase tracking-normal text-muted-foreground"
              >
                Status
              </label>
              <select
                id={`task-status-${task.id}`}
                name="status"
                defaultValue={task.status}
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
            >
              Update status
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
