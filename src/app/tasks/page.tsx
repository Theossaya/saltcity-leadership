import { redirect } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { createTask } from "@/features/tasks/actions";
import { TaskCard } from "@/features/tasks/components/task-card";
import { TaskEmptyState } from "@/features/tasks/components/task-empty-state";
import { TaskSummaryCard } from "@/features/tasks/components/task-summary-card";
import {
  getAdminTasksOverview,
  getLeaderTasks,
  getTaskCreateOptions,
  type TaskCreateOptions,
  type TaskOverview,
} from "@/features/tasks/queries";
import { TASK_PRIORITIES, TASK_PRIORITY_LABELS } from "@/lib/constants/statuses";
import { getTaskCreateMinimumDueDate } from "@/lib/validation/tasks";

type TasksPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
    updated?: string | string[];
    error?: string | string[];
  }>;
};

function formatRoleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function RestrictedState() {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Task access</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Task visibility is limited to church admins and active leaders with
          assigned or visible tasks.
        </p>
      </CardContent>
    </Card>
  );
}

function TaskList({ overview }: { overview: TaskOverview }) {
  if (overview.tasks.length === 0) {
    return <TaskEmptyState />;
  }

  return (
    <section className="grid gap-3">
      {overview.tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </section>
  );
}

function CreateTaskForm({
  minimumDueDate,
  options,
}: {
  minimumDueDate: string;
  options: TaskCreateOptions;
}) {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Create task</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createTask} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              name="title"
              maxLength={160}
              required
              className="h-12 bg-background"
              placeholder="What needs to be done?"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              name="description"
              maxLength={2000}
              className="min-h-24 bg-background"
              placeholder="Optional context for the assigned leader."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="task-assigned-to">Assigned leader</Label>
              <select
                id="task-assigned-to"
                name="assignedTo"
                defaultValue=""
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="">Unassigned</option>
                {options.assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name} - {formatRoleLabel(assignee.role)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                name="dueDate"
                type="date"
                min={minimumDueDate}
                className="h-12 bg-background"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-priority">Priority</Label>
              <select
                id="task-priority"
                name="priority"
                defaultValue="normal"
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="task-linked-company">Linked company</Label>
              <input type="hidden" name="linkedEntityType" value="company" />
              <select
                id="task-linked-company"
                name="linkedEntityId"
                defaultValue=""
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="">No company link</option>
                {options.companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="task-follow-up-case">Follow-up case</Label>
              <select
                id="task-follow-up-case"
                name="followUpCaseId"
                defaultValue=""
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="">No follow-up link</option>
                {options.followUpCases.map((followUpCase) => (
                  <option key={followUpCase.id} value={followUpCase.id}>
                    {followUpCase.label} - {followUpCase.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border/80 pt-1">
            <Button
              type="submit"
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
            >
              Create task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const createdParam = resolvedSearchParams?.created;
  const updatedParam = resolvedSearchParams?.updated;
  const errorParam = resolvedSearchParams?.error;
  const taskCreated =
    (Array.isArray(createdParam) ? createdParam[0] : createdParam) === "task";
  const taskStatusUpdated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) === "status";
  const createError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-create-task";
  const statusUpdateError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-update-task";
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isLeader = Boolean(primaryRole);
  const minimumDueDate = getTaskCreateMinimumDueDate();
  const actionNotice = (
    <>
      {taskCreated ? (
        <Alert className="border-[#C8BDAF] bg-[#FBFAF8]">
          <AlertDescription>Task created.</AlertDescription>
        </Alert>
      ) : null}

      {taskStatusUpdated ? (
        <Alert className="border-[#C8BDAF] bg-[#FBFAF8]">
          <AlertDescription>Task status updated.</AlertDescription>
        </Alert>
      ) : null}

      {createError ? (
        <Alert variant="destructive">
          <AlertDescription>Task could not be created.</AlertDescription>
        </Alert>
      ) : null}

      {statusUpdateError ? (
        <Alert variant="destructive">
          <AlertDescription>Task status could not be updated.</AlertDescription>
        </Alert>
      ) : null}
    </>
  );

  let title = "Tasks";
  let subtitle = "Tasks assigned to you.";
  let content = <RestrictedState />;

  if (!churchId) {
    content = (
      <Card className="rounded-lg border-border/80 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            No active church membership found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Task visibility depends on an active church membership. Ask an admin
            to confirm your access.
          </p>
        </CardContent>
      </Card>
    );
  } else if (isAdmin) {
    title = "Tasks";
    subtitle = "Leadership task visibility across the church.";

    const [tasksResult, createOptionsResult] = await Promise.all([
      getAdminTasksOverview(churchId, user.id),
      getTaskCreateOptions(churchId),
    ]);
    const overview = tasksResult.data;

    content = (
      <>
        {tasksResult.error ? <QueryNotice message={tasksResult.error} /> : null}
        {createOptionsResult.error ? (
          <QueryNotice message={createOptionsResult.error} />
        ) : null}

        <CreateTaskForm
          minimumDueDate={minimumDueDate}
          options={createOptionsResult.data}
        />

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-5">
          <TaskSummaryCard label="Total tasks" value={overview.summary.totalTasks} />
          <TaskSummaryCard label="Open" value={overview.summary.open} />
          <TaskSummaryCard
            label="In progress"
            value={overview.summary.inProgress}
          />
          <TaskSummaryCard label="Done" value={overview.summary.done} />
          {overview.summary.hasDueDates ? (
            <TaskSummaryCard label="Overdue" value={overview.summary.overdue} />
          ) : null}
        </section>

        <TaskList overview={overview} />
      </>
    );
  } else if (isLeader) {
    title = "Tasks";
    subtitle = "Tasks assigned to you.";

    const tasksResult = await getLeaderTasks(user.id, churchId);
    const overview = tasksResult.data;

    content = (
      <>
        {tasksResult.error ? <QueryNotice message={tasksResult.error} /> : null}

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-4">
          <TaskSummaryCard label="Total tasks" value={overview.summary.totalTasks} />
          <TaskSummaryCard label="Open" value={overview.summary.open} />
          <TaskSummaryCard
            label="In progress"
            value={overview.summary.inProgress}
          />
          <TaskSummaryCard label="Done" value={overview.summary.done} />
        </section>

        <TaskList overview={overview} />
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <PageHeader title={title} subtitle={subtitle} />

      {actionNotice}

      {content}
    </AppShell>
  );
}
