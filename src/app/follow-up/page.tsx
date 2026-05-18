import { redirect } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { FollowUpCard } from "@/features/follow-up/components/follow-up-card";
import { FollowUpEmptyState } from "@/features/follow-up/components/follow-up-empty-state";
import { FollowUpSummaryCard } from "@/features/follow-up/components/follow-up-summary-card";
import {
  getAdminFollowUpQueue,
  getAssignedFollowUpQueue,
  getCompanyFollowUpQueue,
  getFollowUpCreateOptions,
  type FollowUpCreateOptions,
  type FollowUpQueue,
  type FollowUpQueueItem,
} from "@/features/follow-up/queries";

type FollowUpPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
    updated?: string | string[];
    error?: string | string[];
  }>;
};

function RestrictedState() {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Follow-up access</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Follow-up visibility is limited to church admins and assigned company
          leaders.
        </p>
      </CardContent>
    </Card>
  );
}

function FollowUpQueueList({
  queue,
  createOptions,
  canCreateCase = false,
}: {
  queue: FollowUpQueue;
  createOptions?: FollowUpCreateOptions;
  canCreateCase?: boolean;
}) {
  if (queue.items.length === 0) {
    return <FollowUpEmptyState />;
  }

  return (
    <section className="grid gap-3">
      {queue.items.map((item) => (
        <FollowUpCard
          key={item.absenteeRecordId}
          item={item}
          createOptions={createOptions}
          canCreateCase={canCreateCase}
        />
      ))}
    </section>
  );
}

function getFollowUpItemKey(item: FollowUpQueueItem) {
  return item.followUpCaseId ?? item.absenteeRecordId;
}

function summarizeFollowUpItems(items: FollowUpQueueItem[]) {
  return {
    totalItems: items.length,
    notStarted: items.filter((item) => item.followUpStatus === "not_started")
      .length,
    withCase: items.filter((item) => item.hasFollowUpCase).length,
    currentWeek: items.filter((item) => item.isCurrentWeek).length,
  };
}

function mergeFollowUpQueues(
  companyQueue: FollowUpQueue,
  assignedQueue: FollowUpQueue,
): FollowUpQueue {
  const itemsByKey = new Map<string, FollowUpQueueItem>();

  for (const item of companyQueue.items) {
    itemsByKey.set(getFollowUpItemKey(item), item);
  }

  for (const item of assignedQueue.items) {
    const key = getFollowUpItemKey(item);
    const existingItem = itemsByKey.get(key);

    itemsByKey.set(
      key,
      existingItem
        ? {
            ...item,
            ...existingItem,
            followUpCaseId: existingItem.followUpCaseId ?? item.followUpCaseId,
            followUpStatus: item.followUpStatus,
            hasFollowUpCase: existingItem.hasFollowUpCase || item.hasFollowUpCase,
            assignedUserId: existingItem.assignedUserId ?? item.assignedUserId,
            assignedUserName:
              existingItem.assignedUserName ?? item.assignedUserName,
            lastContactDate: item.lastContactDate ?? existingItem.lastContactDate,
            nextAction: item.nextAction ?? existingItem.nextAction,
            notes: item.notes ?? existingItem.notes,
            resolvedAt: item.resolvedAt ?? existingItem.resolvedAt,
            followUpCaseCreatedAt:
              existingItem.followUpCaseCreatedAt ?? item.followUpCaseCreatedAt,
            canUpdateCase: existingItem.canUpdateCase || item.canUpdateCase,
          }
        : item,
    );
  }

  const items = Array.from(itemsByKey.values()).sort((first, second) => {
    if (first.isCurrentWeek !== second.isCurrentWeek) {
      return first.isCurrentWeek ? -1 : 1;
    }

    return second.absenceDate.localeCompare(first.absenceDate);
  });

  return {
    week: companyQueue.week,
    items,
    summary: summarizeFollowUpItems(items),
  };
}

export default async function FollowUpPage({ searchParams }: FollowUpPageProps) {
  const resolvedSearchParams = await searchParams;
  const createdParam = resolvedSearchParams?.created;
  const updatedParam = resolvedSearchParams?.updated;
  const errorParam = resolvedSearchParams?.error;
  const caseCreated =
    (Array.isArray(createdParam) ? createdParam[0] : createdParam) === "case";
  const caseUpdated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) === "case";
  const createError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-create-case";
  const updateError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-update-case";
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";
  const actionNotice = (
    <>
      {caseCreated ? (
        <Alert className="border-[#C8BDAF] bg-[#FBFAF8]">
          <AlertDescription>Follow-up case created.</AlertDescription>
        </Alert>
      ) : null}

      {caseUpdated ? (
        <Alert className="border-[#C8BDAF] bg-[#FBFAF8]">
          <AlertDescription>Follow-up case updated.</AlertDescription>
        </Alert>
      ) : null}

      {createError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Follow-up case could not be created.
          </AlertDescription>
        </Alert>
      ) : null}

      {updateError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Follow-up case could not be updated.
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  );

  let title = "Follow-up";
  let subtitle = "Absentee follow-up visibility will appear when assigned.";
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
            Follow-up visibility depends on an active church membership. Ask an
            admin to confirm your access.
          </p>
        </CardContent>
      </Card>
    );
  } else if (isAdmin) {
    title = "Follow-up";
    subtitle = "Absentee follow-up visibility across companies.";

    const [queueResult, createOptionsResult] = await Promise.all([
      getAdminFollowUpQueue(churchId, user.id),
      getFollowUpCreateOptions(churchId),
    ]);
    const queue = queueResult.data;

    content = (
      <>
        {queueResult.error ? <QueryNotice message={queueResult.error} /> : null}
        {createOptionsResult.error ? (
          <QueryNotice message={createOptionsResult.error} />
        ) : null}

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-4">
          <FollowUpSummaryCard
            label="Total items"
            value={queue.summary.totalItems}
          />
          <FollowUpSummaryCard
            label="Not started"
            value={queue.summary.notStarted}
          />
          <FollowUpSummaryCard
            label="With case"
            value={queue.summary.withCase}
          />
          <FollowUpSummaryCard
            label="Current week"
            value={queue.summary.currentWeek}
          />
        </section>

        <FollowUpQueueList
          queue={queue}
          createOptions={createOptionsResult.data}
          canCreateCase
        />
      </>
    );
  } else if (isCompanyLeader) {
    title = "Follow-up";
    subtitle = "Absentee follow-up for your assigned company.";

    const [companyQueueResult, assignedQueueResult] = await Promise.all([
      getCompanyFollowUpQueue(user.id, churchId),
      getAssignedFollowUpQueue(user.id, churchId),
    ]);
    const queue = mergeFollowUpQueues(
      companyQueueResult.data,
      assignedQueueResult.data,
    );

    content = (
      <>
        {companyQueueResult.error ? (
          <QueryNotice message={companyQueueResult.error} />
        ) : null}
        {assignedQueueResult.error ? (
          <QueryNotice message={assignedQueueResult.error} />
        ) : null}

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-3">
          <FollowUpSummaryCard
            label="Total items"
            value={queue.summary.totalItems}
          />
          <FollowUpSummaryCard
            label="Current week"
            value={queue.summary.currentWeek}
          />
          <FollowUpSummaryCard
            label="Not started"
            value={queue.summary.notStarted}
          />
        </section>

        <FollowUpQueueList queue={queue} />
      </>
    );
  } else {
    title = "Follow-up";
    subtitle = "Follow-up cases assigned to you.";

    const queueResult = await getAssignedFollowUpQueue(user.id, churchId);
    const queue = queueResult.data;

    content = (
      <>
        {queueResult.error ? <QueryNotice message={queueResult.error} /> : null}

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-3">
          <FollowUpSummaryCard
            label="Assigned"
            value={queue.summary.totalItems}
          />
          <FollowUpSummaryCard
            label="Contacted"
            value={
              queue.items.filter((item) => item.followUpStatus === "contacted")
                .length
            }
          />
          <FollowUpSummaryCard
            label="Escalated"
            value={
              queue.items.filter((item) => item.followUpStatus === "escalated")
                .length
            }
          />
        </section>

        <FollowUpQueueList queue={queue} />
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
