import { createClient } from "@/lib/supabase/server";

export type TaskStatus = "todo" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type TaskListItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: string | null;
  assignedUserName: string | null;
  companyName: string | null;
  followUpCaseId: string | null;
  followUpCaseStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskSummary = {
  totalTasks: number;
  open: number;
  inProgress: number;
  done: number;
  overdue: number;
  hasDueDates: boolean;
};

export type TaskOverview = {
  tasks: TaskListItem[];
  summary: TaskSummary;
};

export type TaskQueryResult<T> = {
  data: T;
  error: string | null;
};

type TaskRow = {
  id: string;
  church_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  follow_up_case_id: string | null;
  linked_entity_type: string | null;
  linked_entity_id: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type CompanyRow = {
  id: string;
  name: string;
};

type FollowUpCaseRow = {
  id: string;
  company_id: string;
  status: string;
};

const emptyOverview: TaskOverview = {
  tasks: [],
  summary: {
    totalTasks: 0,
    open: 0,
    inProgress: 0,
    done: 0,
    overdue: 0,
    hasDueDates: false,
  },
};

function toErrorMessage(scope: string, message: string) {
  return `${scope}: ${message}`;
}

function uniqueIds(ids: Array<string | null>) {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function summarize(tasks: TaskListItem[]): TaskSummary {
  const today = todayInLagos();

  return {
    totalTasks: tasks.length,
    open: tasks.filter(
      (task) => task.status === "todo" || task.status === "blocked",
    ).length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    done: tasks.filter((task) => task.status === "done").length,
    overdue: tasks.filter(
      (task) =>
        Boolean(task.dueDate) &&
        task.status !== "done" &&
        task.dueDate! < today,
    ).length,
    hasDueDates: tasks.some((task) => Boolean(task.dueDate)),
  };
}

function sortTasks(first: TaskRow, second: TaskRow) {
  if (first.status === "done" && second.status !== "done") {
    return 1;
  }

  if (first.status !== "done" && second.status === "done") {
    return -1;
  }

  if (first.due_date && second.due_date) {
    return first.due_date.localeCompare(second.due_date);
  }

  if (first.due_date) {
    return -1;
  }

  if (second.due_date) {
    return 1;
  }

  return second.created_at.localeCompare(first.created_at);
}

function mergeTasks(taskGroups: TaskRow[][]) {
  const tasksById = new Map<string, TaskRow>();

  for (const task of taskGroups.flat()) {
    tasksById.set(task.id, task);
  }

  return Array.from(tasksById.values()).sort(sortTasks);
}

async function getAssignedCompanyIds(userId: string, churchId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("church_id", churchId)
    .or(`leader_id.eq.${userId},assistant_leader_id.eq.${userId}`)
    .eq("status", "active")
    .returns<Array<{ id: string }>>();

  if (error) {
    return {
      companyIds: [],
      error: toErrorMessage("Unable to load assigned task company", error.message),
    };
  }

  return {
    companyIds: (data ?? []).map((company) => company.id),
    error: null,
  };
}

async function getCompanyFollowUpCaseIds(churchId: string, companyIds: string[]) {
  if (companyIds.length === 0) {
    return {
      followUpCaseIds: [],
      error: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("follow_up_cases")
    .select("id")
    .eq("church_id", churchId)
    .in("company_id", companyIds)
    .returns<Array<{ id: string }>>();

  if (error) {
    return {
      followUpCaseIds: [],
      error: toErrorMessage("Unable to load linked follow-up tasks", error.message),
    };
  }

  return {
    followUpCaseIds: (data ?? []).map((followUpCase) => followUpCase.id),
    error: null,
  };
}

async function enrichTasks(tasks: TaskRow[]): Promise<TaskQueryResult<TaskOverview>> {
  if (tasks.length === 0) {
    return {
      data: emptyOverview,
      error: null,
    };
  }

  const supabase = await createClient();
  const assignedUserIds = uniqueIds(tasks.map((task) => task.assigned_to));
  const followUpCaseIds = uniqueIds(tasks.map((task) => task.follow_up_case_id));
  const linkedCompanyIds = uniqueIds(
    tasks.map((task) =>
      task.linked_entity_type === "company" ? task.linked_entity_id : null,
    ),
  );

  const [
    { data: profilesData, error: profilesError },
    { data: followUpCasesData, error: followUpCasesError },
  ] = await Promise.all([
    assignedUserIds.length > 0
      ? supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", assignedUserIds)
          .returns<ProfileRow[]>()
      : Promise.resolve({ data: [], error: null }),
    followUpCaseIds.length > 0
      ? supabase
          .from("follow_up_cases")
          .select("id, company_id, status")
          .in("id", followUpCaseIds)
          .returns<FollowUpCaseRow[]>()
      : Promise.resolve({ data: [], error: null }),
  ]);

  const followUpCases = followUpCasesData ?? [];
  const followUpCompanyIds = uniqueIds(
    followUpCases.map((followUpCase) => followUpCase.company_id),
  );
  const companyIds = uniqueIds([...linkedCompanyIds, ...followUpCompanyIds]);

  const { data: companiesData, error: companiesError } =
    companyIds.length > 0
      ? await supabase
          .from("companies")
          .select("id, name")
          .in("id", companyIds)
          .returns<CompanyRow[]>()
      : { data: [], error: null };

  const profilesById = new Map(
    (profilesData ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? "Assigned leader",
    ]),
  );
  const followUpCasesById = new Map(
    followUpCases.map((followUpCase) => [followUpCase.id, followUpCase]),
  );
  const companiesById = new Map(
    (companiesData ?? []).map((company) => [company.id, company]),
  );

  const items = tasks.map((task) => {
    const followUpCase = task.follow_up_case_id
      ? followUpCasesById.get(task.follow_up_case_id)
      : null;
    const companyId =
      followUpCase?.company_id ??
      (task.linked_entity_type === "company" ? task.linked_entity_id : null);

    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assignedUserName: task.assigned_to
        ? profilesById.get(task.assigned_to) ?? "Assigned leader"
        : null,
      companyName: companyId ? companiesById.get(companyId)?.name ?? null : null,
      followUpCaseId: task.follow_up_case_id,
      followUpCaseStatus: followUpCase?.status ?? null,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    } satisfies TaskListItem;
  });

  return {
    data: {
      tasks: items,
      summary: summarize(items),
    },
    error:
      [
        profilesError
          ? toErrorMessage("Unable to load task assignees", profilesError.message)
          : null,
        followUpCasesError
          ? toErrorMessage("Unable to load task follow-up links", followUpCasesError.message)
          : null,
        companiesError
          ? toErrorMessage("Unable to load task companies", companiesError.message)
          : null,
      ]
        .filter(Boolean)
        .join(" ") || null,
  };
}

export async function getAdminTasksOverview(
  churchId: string,
): Promise<TaskQueryResult<TaskOverview>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, church_id, title, description, assigned_to, due_date, priority, status, follow_up_case_id, linked_entity_type, linked_entity_id, created_at, updated_at",
    )
    .eq("church_id", churchId)
    .order("created_at", { ascending: false })
    .returns<TaskRow[]>();

  if (error) {
    return {
      data: emptyOverview,
      error: toErrorMessage("Unable to load church tasks", error.message),
    };
  }

  return enrichTasks((data ?? []).sort(sortTasks));
}

export async function getLeaderTasks(
  userId: string,
  churchId: string,
): Promise<TaskQueryResult<TaskOverview>> {
  const supabase = await createClient();
  const assignedCompanies = await getAssignedCompanyIds(userId, churchId);
  const companyFollowUpCases = await getCompanyFollowUpCaseIds(
    churchId,
    assignedCompanies.companyIds,
  );

  const taskSelect =
    "id, church_id, title, description, assigned_to, due_date, priority, status, follow_up_case_id, linked_entity_type, linked_entity_id, created_at, updated_at";

  const taskQueries = [
    supabase
      .from("tasks")
      .select(taskSelect)
      .eq("church_id", churchId)
      .eq("assigned_to", userId)
      .returns<TaskRow[]>(),
  ];

  if (companyFollowUpCases.followUpCaseIds.length > 0) {
    taskQueries.push(
      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("church_id", churchId)
        .in("follow_up_case_id", companyFollowUpCases.followUpCaseIds)
        .returns<TaskRow[]>(),
    );
  }

  if (assignedCompanies.companyIds.length > 0) {
    taskQueries.push(
      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("church_id", churchId)
        .eq("linked_entity_type", "company")
        .in("linked_entity_id", assignedCompanies.companyIds)
        .returns<TaskRow[]>(),
    );
  }

  const taskResults = await Promise.all(taskQueries);
  const taskError = taskResults.find((result) => result.error)?.error;

  if (taskError) {
    return {
      data: emptyOverview,
      error: toErrorMessage("Unable to load assigned tasks", taskError.message),
    };
  }

  const enriched = await enrichTasks(
    mergeTasks(taskResults.map((result) => result.data ?? [])),
  );

  return {
    data: enriched.data,
    error:
      [
        assignedCompanies.error,
        companyFollowUpCases.error,
        enriched.error,
      ]
        .filter(Boolean)
        .join(" ") || null,
  };
}
