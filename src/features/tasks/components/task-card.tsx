import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TaskListItem, TaskPriority, TaskStatus } from "@/features/tasks/queries";
import {
  FOLLOW_UP_STATUS_LABELS,
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
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {task.companyName ?? "Leadership task"}
            </p>
            <CardTitle className="mt-1 text-xl font-semibold">
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
        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-4 sm:grid-cols-3">
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
          <p className="text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
