import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { TaskCard } from "@/features/tasks/components/task-card";
import { TaskEmptyState } from "@/features/tasks/components/task-empty-state";
import { TaskSummaryCard } from "@/features/tasks/components/task-summary-card";
import {
  getAdminTasksOverview,
  getLeaderTasks,
  type TaskOverview,
} from "@/features/tasks/queries";

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

export default async function TasksPage() {
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isLeader = Boolean(primaryRole);

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

    const tasksResult = await getAdminTasksOverview(churchId);
    const overview = tasksResult.data;

    content = (
      <>
        {tasksResult.error ? <QueryNotice message={tasksResult.error} /> : null}

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

      {content}
    </AppShell>
  );
}
