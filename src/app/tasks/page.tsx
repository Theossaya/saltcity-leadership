import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { QueryNotice } from "@/components/ui/query-notice";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Button } from "@/components/v2/primitives/button";
import { Counter } from "@/components/v2/primitives/counter";
import {
  Field,
  Select,
  TextArea,
  TextInput,
} from "@/components/v2/primitives/field";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { createTask } from "@/features/tasks/actions";
import { TaskCard } from "@/features/tasks/components/task-card";
import { TaskEmptyState } from "@/features/tasks/components/task-empty-state";
import {
  getAdminTasksOverview,
  getLeaderTasks,
  getTaskCreateOptions,
  type TaskCreateOptions,
  type TaskListItem,
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
    <>
      <V2Sect>Task access</V2Sect>
      <TaskEmptyState
        title="Tasks are not visible here."
        message="Task visibility is limited to church admins and active leaders with assigned or visible tasks."
      />
    </>
  );
}

function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function groupTasks(tasks: TaskListItem[]) {
  const today = todayInLagos();
  const weekEnd = addDays(today, 6);
  const todayTasks: TaskListItem[] = [];
  const thisWeekTasks: TaskListItem[] = [];
  const laterTasks: TaskListItem[] = [];
  const doneTasks: TaskListItem[] = [];

  for (const task of tasks) {
    if (task.status === "done") {
      doneTasks.push(task);
    } else if (task.dueDate && task.dueDate <= today) {
      todayTasks.push(task);
    } else if (task.dueDate && task.dueDate <= weekEnd) {
      thisWeekTasks.push(task);
    } else {
      laterTasks.push(task);
    }
  }

  return [
    {
      label: "Today",
      emptyTitle: "Today is clear.",
      empty: "Nothing is due today. Keep the rhythm.",
      tasks: todayTasks,
    },
    {
      label: "This week",
      emptyTitle: "This week is clear.",
      empty: "No other tasks are dated for this week.",
      tasks: thisWeekTasks,
    },
    {
      label: "Later / no due date",
      emptyTitle: "The later list is clear.",
      empty: "Undated or later tasks will appear here.",
      tasks: laterTasks,
    },
    {
      label: "Done",
      emptyTitle: "Closed tasks will rest here.",
      empty: "Completed tasks appear here after they are marked done.",
      tasks: doneTasks,
    },
  ];
}

function getChecklistTitleCount(tasks: TaskListItem[]) {
  const [todayGroup, thisWeekGroup] = groupTasks(tasks);

  return todayGroup.tasks.length + thisWeekGroup.tasks.length;
}

function TaskGroup({
  label,
  tasks,
  emptyTitle,
  empty,
}: {
  label: string;
  tasks: TaskListItem[];
  emptyTitle: string;
  empty: string;
}) {
  return (
    <>
      <V2Sect action={`${tasks.length}`}>{label}</V2Sect>
      {tasks.length > 0 ? (
        <section className="rounded-card bg-surface p-[18px] shadow-lift">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </section>
      ) : (
        <TaskEmptyState title={emptyTitle} message={empty} />
      )}
    </>
  );
}

function TaskList({ overview }: { overview: TaskOverview }) {
  if (overview.tasks.length === 0) {
    return (
      <TaskEmptyState
        title="Nothing pressing."
        message="Rest is part of the work."
      />
    );
  }

  return (
    <>
      {groupTasks(overview.tasks).map((group) => (
        <TaskGroup
          key={group.label}
          label={group.label}
          tasks={group.tasks}
          emptyTitle={group.emptyTitle}
          empty={group.empty}
        />
      ))}
    </>
  );
}

function TaskSummaryStrip({ overview }: { overview: TaskOverview }) {
  const highPriority = overview.tasks.filter(
    (task) => task.priority === "high" || task.priority === "urgent",
  ).length;

  return (
    <section className="mt-[18px] grid grid-cols-2 gap-3 rounded-card bg-surface p-[18px] shadow-lift sm:grid-cols-4">
      <Counter value={overview.summary.totalTasks} label="Total" />
      <Counter value={highPriority} label="High priority" />
      <Counter value={overview.summary.inProgress} label="In progress" />
      <Counter value={overview.summary.done} label="Done" />
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
    <>
      <V2Sect>Church office</V2Sect>
      <details className="rounded-card bg-surface p-[18px] shadow-lift">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-sans text-sm font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
          <span>Create task</span>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            Admin
          </span>
        </summary>
        <form action={createTask} className="mt-4 grid gap-4">
          <Field htmlFor="task-title" label="Title">
            <TextInput
              id="task-title"
              name="title"
              maxLength={160}
              required
              placeholder="What needs to be done?"
            />
          </Field>

          <Field htmlFor="task-description" label="Description">
            <TextArea
              id="task-description"
              name="description"
              maxLength={2000}
              placeholder="Optional context for the assigned leader."
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field htmlFor="task-assigned-to" label="Assigned leader">
              <Select
                id="task-assigned-to"
                name="assignedTo"
                defaultValue=""
              >
                <option value="">Unassigned</option>
                {options.assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name} - {formatRoleLabel(assignee.role)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field htmlFor="task-due-date" label="Due date">
              <TextInput
                id="task-due-date"
                name="dueDate"
                type="date"
                min={minimumDueDate}
              />
            </Field>

            <Field htmlFor="task-priority" label="Priority">
              <Select
                id="task-priority"
                name="priority"
                defaultValue="normal"
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="task-linked-company" label="Linked company">
              <input type="hidden" name="linkedEntityType" value="company" />
              <Select
                id="task-linked-company"
                name="linkedEntityId"
                defaultValue=""
              >
                <option value="">No company link</option>
                {options.companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field htmlFor="task-follow-up-case" label="Follow-up case">
              <Select
                id="task-follow-up-case"
                name="followUpCaseId"
                defaultValue=""
              >
                <option value="">No follow-up link</option>
                {options.followUpCases.map((followUpCase) => (
                  <option key={followUpCase.id} value={followUpCase.id}>
                    {followUpCase.label} - {followUpCase.status}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="pt-1">
            <Button type="submit" className="w-full sm:w-fit">
              Create task
            </Button>
          </div>
        </form>
      </details>
    </>
  );
}

function getChecklistTitle(totalTasks: number) {
  if (totalTasks === 0) {
    return <>Nothing pressing <em>this week.</em></>;
  }

  if (totalTasks === 1) {
    return (
      <>
        One to close <em>this week.</em>
      </>
    );
  }

  return (
    <>
      {totalTasks} to close <em>this week.</em>
    </>
  );
}

function getChecklistSubtitle(overview?: TaskOverview, admin = false) {
  if (!overview) {
    return "A simple, gentle pass through what has been entrusted to you.";
  }

  if (overview.summary.totalTasks === 0) {
    return admin
      ? "No church-wide tasks are pressing today."
      : "Nothing pressing. Rest is part of the work.";
  }

  return admin
    ? "A clear pass through the church-wide leadership checklist."
    : "A simple, gentle pass through what you've taken on.";
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
  const hasActionNotice =
    taskCreated || taskStatusUpdated || createError || statusUpdateError;
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
    <div className="mt-4 grid gap-3">
      {taskCreated ? (
        <QueryNotice tone="ok" message="Task created and added to the checklist." />
      ) : null}

      {taskStatusUpdated ? (
        <QueryNotice tone="ok" message="Task status saved." />
      ) : null}

      {createError ? (
        <QueryNotice message="Task could not be created. Check the title, due date, and assignment, then try again." />
      ) : null}

      {statusUpdateError ? (
        <QueryNotice message="Task status could not be saved. Try again." />
      ) : null}
    </div>
  );

  let title = getChecklistTitle(0);
  let subtitle = getChecklistSubtitle();
  let content = <RestrictedState />;

  if (!churchId) {
    subtitle = "Ask an admin to confirm your active church membership.";
    content = (
      <TaskEmptyState
        title="Active church membership needed."
        message="Task visibility depends on an active church membership."
      />
    );
  } else if (isAdmin) {
    const [tasksResult, createOptionsResult] = await Promise.all([
      getAdminTasksOverview(churchId, user.id),
      getTaskCreateOptions(churchId),
    ]);
    const overview = tasksResult.data;
    title = getChecklistTitle(getChecklistTitleCount(overview.tasks));
    subtitle = getChecklistSubtitle(overview, true);

    content = (
      <>
        {tasksResult.error ? (
          <QueryNotice message="We could not load the church task list. Try again shortly." />
        ) : null}
        {createOptionsResult.error ? (
          <QueryNotice message="Task assignment options could not be loaded. You can still review existing tasks." />
        ) : null}

        <CreateTaskForm
          minimumDueDate={minimumDueDate}
          options={createOptionsResult.data}
        />

        <TaskSummaryStrip overview={overview} />

        <TaskList overview={overview} />
      </>
    );
  } else if (isLeader) {
    const tasksResult = await getLeaderTasks(user.id, churchId);
    const overview = tasksResult.data;
    title = getChecklistTitle(getChecklistTitleCount(overview.tasks));
    subtitle = getChecklistSubtitle(overview);

    content = (
      <>
        {tasksResult.error ? (
          <QueryNotice message="We could not load your assigned tasks. Try again shortly." />
        ) : null}

        <TaskSummaryStrip overview={overview} />

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
      <V2Greeting
        eyebrow="Leadership Checklist"
        title={title}
        subtitle={subtitle}
      />

      {hasActionNotice ? actionNotice : null}

      {content}
    </AppShell>
  );
}
