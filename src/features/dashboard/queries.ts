import type { LeadershipRole } from "@/features/auth/get-current-user";
import {
  getAdminAnnouncements,
  getLeaderAnnouncements,
  type AnnouncementListItem,
} from "@/features/announcements/queries";
import {
  getAdminEvents,
  getLeaderEvents,
  type EventListItem,
} from "@/features/events/queries";
import {
  getAdminFollowUpQueue,
  getAssignedFollowUpQueue,
  type FollowUpQueueItem,
} from "@/features/follow-up/queries";
import {
  getAdminReportsOverview,
  getCompanyReportWorkspace,
  type AdminReportCompanyRow,
  type AdminReportsOverview,
  type CompanyReportWorkspace,
} from "@/features/reports/queries";
import {
  getAdminTasksOverview,
  getLeaderTasks,
  type TaskListItem,
} from "@/features/tasks/queries";

const APP_TIME_ZONE = "Africa/Lagos";
const PREVIEW_LIMIT = 3;
const DEFAULT_EVENT_DURATION_HOURS = 3;

export type DashboardReportBrief =
  | {
      kind: "company";
      workspace: CompanyReportWorkspace;
      progress: number;
    }
  | {
      kind: "admin";
      overview: AdminReportsOverview;
      reviewedReports: number;
      awaitingReview: AdminReportCompanyRow[];
      flaggedRows: AdminReportCompanyRow[];
      missingRows: AdminReportCompanyRow[];
      progress: number;
    }
  | {
      kind: "none";
    };

export type DashboardCareBrief = {
  activeCount: number;
  urgentCount: number;
  items: FollowUpQueueItem[];
};

export type DashboardTaskPreviewItem = {
  task: TaskListItem;
  timing: "overdue" | "today" | "this_week";
};

export type DashboardTaskBrief = {
  actionableCount: number;
  overdueCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  tasks: DashboardTaskPreviewItem[];
};

export type DashboardAnnouncementBrief = {
  activeCount: number;
  urgentCount: number;
  announcement: AnnouncementListItem | null;
};

export type DashboardEventBrief = {
  happeningNow: EventListItem | null;
  upcoming: EventListItem | null;
};

export type DashboardBriefing = {
  report: DashboardReportBrief;
  care: DashboardCareBrief;
  tasks: DashboardTaskBrief;
  announcements: DashboardAnnouncementBrief;
  events: DashboardEventBrief;
  errors: string[];
};

function isAdminRole(role: LeadershipRole | null) {
  return role === "church_admin" || role === "super_admin";
}

function isCompanyReportRole(role: LeadershipRole | null) {
  return role === "company_leader" || role === "assistant_leader";
}

function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
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

function getWeekStart(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  const day = date.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;

  date.setUTCDate(date.getUTCDate() - daysSinceMonday);

  return date.toISOString().slice(0, 10);
}

function isClosedEvent(event: EventListItem) {
  return event.status === "completed" || event.status === "cancelled";
}

function getEventActiveUntil(event: EventListItem) {
  if (event.endsAt) {
    return new Date(event.endsAt);
  }

  const activeUntil = new Date(event.startsAt);
  activeUntil.setHours(activeUntil.getHours() + DEFAULT_EVENT_DURATION_HOURS);

  return activeUntil;
}

function isUrgentCare(item: FollowUpQueueItem) {
  return item.followUpStatus === "escalated" || item.priority === "urgent";
}

function sortCareItems(items: FollowUpQueueItem[]) {
  return [...items].sort((first, second) => {
    const firstUrgent = isUrgentCare(first);
    const secondUrgent = isUrgentCare(second);

    if (firstUrgent !== secondUrgent) {
      return firstUrgent ? -1 : 1;
    }

    if (first.isCurrentWeek !== second.isCurrentWeek) {
      return first.isCurrentWeek ? -1 : 1;
    }

    return second.absenceDate.localeCompare(first.absenceDate);
  });
}

function getReportProgress(status: CompanyReportWorkspace["reportStatus"]) {
  if (status === "reviewed") {
    return 100;
  }

  if (status === "submitted") {
    return 75;
  }

  if (status === "flagged") {
    return 65;
  }

  if (status === "draft") {
    return 45;
  }

  return 0;
}

function getAdminReportBrief(overview: AdminReportsOverview) {
  const reviewedReports = overview.rows.filter(
    (row) => row.reportStatus === "reviewed",
  ).length;
  const awaitingReview = overview.rows
    .filter((row) => row.reportStatus === "submitted")
    .slice(0, PREVIEW_LIMIT);
  const flaggedRows = overview.rows
    .filter((row) => row.reportStatus === "flagged")
    .slice(0, PREVIEW_LIMIT);
  const missingRows = overview.rows
    .filter((row) => row.reportStatus === "not_started")
    .slice(0, PREVIEW_LIMIT);
  const received = overview.summary.submittedReports;
  const total = overview.summary.totalCompanies;

  return {
    kind: "admin" as const,
    overview,
    reviewedReports,
    awaitingReview,
    flaggedRows,
    missingRows,
    progress: total > 0 ? Math.round((received / total) * 100) : 0,
  };
}

function getCareBrief(items: FollowUpQueueItem[]): DashboardCareBrief {
  const activeItems = items.filter((item) => item.followUpStatus !== "resolved");
  const sortedItems = sortCareItems(activeItems);

  return {
    activeCount: activeItems.length,
    urgentCount: activeItems.filter(isUrgentCare).length,
    items: sortedItems.slice(0, PREVIEW_LIMIT),
  };
}

function isUnfinishedDatedTask(task: TaskListItem) {
  return task.status !== "done" && Boolean(task.dueDate);
}

function isDueToday(task: TaskListItem, today: string) {
  return isUnfinishedDatedTask(task) && task.dueDate === today;
}

function isOverdue(task: TaskListItem, weekStart: string) {
  return isUnfinishedDatedTask(task) && task.dueDate! < weekStart;
}

function isDueThisWeek(task: TaskListItem, weekStart: string, weekEnd: string) {
  return (
    isUnfinishedDatedTask(task) &&
    task.dueDate! >= weekStart &&
    task.dueDate! <= weekEnd
  );
}

function getTaskBrief(tasks: TaskListItem[]): DashboardTaskBrief {
  const today = todayInLagos();
  const weekStart = getWeekStart(today);
  const weekEnd = addDays(weekStart, 6);
  const overdueTasks = tasks.filter((task) => isOverdue(task, weekStart));
  const dueTodayTasks = tasks.filter((task) => isDueToday(task, today));
  const dueThisWeekTasks = tasks.filter((task) =>
    isDueThisWeek(task, weekStart, weekEnd),
  );
  const previewTasks = [
    ...overdueTasks.map((task) => ({ task, timing: "overdue" as const })),
    ...dueTodayTasks.map((task) => ({ task, timing: "today" as const })),
    ...dueThisWeekTasks
      .filter((task) => task.dueDate !== today)
      .map((task) => ({ task, timing: "this_week" as const })),
  ];

  return {
    actionableCount: dueThisWeekTasks.length,
    overdueCount: overdueTasks.length,
    dueTodayCount: dueTodayTasks.length,
    dueThisWeekCount: dueThisWeekTasks.length,
    tasks: previewTasks.slice(0, PREVIEW_LIMIT),
  };
}

function getAnnouncementBrief(
  announcements: AnnouncementListItem[],
): DashboardAnnouncementBrief {
  const activeAnnouncements = announcements.filter(
    (announcement) => !announcement.isExpired,
  );
  const urgentAnnouncements = activeAnnouncements.filter(
    (announcement) => announcement.isUrgent,
  );

  return {
    activeCount: activeAnnouncements.length,
    urgentCount: urgentAnnouncements.length,
    announcement: urgentAnnouncements[0] ?? activeAnnouncements[0] ?? null,
  };
}

function getEventBrief(events: EventListItem[]): DashboardEventBrief {
  const now = new Date();
  const happeningNow =
    events.find((event) => {
      const startsAt = new Date(event.startsAt);
      const activeUntil = getEventActiveUntil(event);

      return !isClosedEvent(event) && startsAt <= now && activeUntil >= now;
    }) ?? null;
  const upcoming =
    events.find(
      (event) => !isClosedEvent(event) && new Date(event.startsAt) > now,
    ) ?? null;

  return {
    happeningNow,
    upcoming,
  };
}

function collectErrors(errors: Array<string | null>) {
  return errors.filter((error): error is string => Boolean(error));
}

export async function getDashboardBriefing({
  userId,
  churchId,
  role,
}: {
  userId: string;
  churchId: string | null;
  role: LeadershipRole | null;
}): Promise<DashboardBriefing> {
  if (!churchId) {
    return {
      report: { kind: "none" },
      care: { activeCount: 0, urgentCount: 0, items: [] },
      tasks: {
        actionableCount: 0,
        overdueCount: 0,
        dueTodayCount: 0,
        dueThisWeekCount: 0,
        tasks: [],
      },
      announcements: { activeCount: 0, urgentCount: 0, announcement: null },
      events: { happeningNow: null, upcoming: null },
      errors: [],
    };
  }

  if (isAdminRole(role)) {
    const [reports, care, tasks, announcements, events] = await Promise.all([
      getAdminReportsOverview(churchId),
      getAdminFollowUpQueue(churchId, userId),
      getAdminTasksOverview(churchId, userId),
      getAdminAnnouncements(churchId),
      getAdminEvents(churchId),
    ]);

    return {
      report: getAdminReportBrief(reports.data),
      care: getCareBrief(care.data.items),
      tasks: getTaskBrief(tasks.data.tasks),
      announcements: getAnnouncementBrief(announcements.data.announcements),
      events: getEventBrief(events.data.events),
      errors: collectErrors([
        reports.error,
        care.error,
        tasks.error,
        announcements.error,
        events.error,
      ]),
    };
  }

  const [care, tasks, announcements, events] = await Promise.all([
    getAssignedFollowUpQueue(userId, churchId),
    getLeaderTasks(userId, churchId),
    getLeaderAnnouncements(userId, churchId),
    getLeaderEvents(userId, churchId),
  ]);

  if (isCompanyReportRole(role)) {
    const report = await getCompanyReportWorkspace(userId, churchId);

    return {
      report: {
        kind: "company",
        workspace: report.data,
        progress: getReportProgress(report.data.reportStatus),
      },
      care: getCareBrief(care.data.items),
      tasks: getTaskBrief(tasks.data.tasks),
      announcements: getAnnouncementBrief(announcements.data.announcements),
      events: getEventBrief(events.data.events),
      errors: collectErrors([
        report.error,
        care.error,
        tasks.error,
        announcements.error,
        events.error,
      ]),
    };
  }

  return {
    report: { kind: "none" },
    care: getCareBrief(care.data.items),
    tasks: getTaskBrief(tasks.data.tasks),
    announcements: getAnnouncementBrief(announcements.data.announcements),
    events: getEventBrief(events.data.events),
    errors: collectErrors([care.error, tasks.error, announcements.error, events.error]),
  };
}
